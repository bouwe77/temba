import { describe, test, expect } from 'vitest'
import request from 'supertest'
import { expectSuccess } from '../helpers'
import { createServer } from '../createServer'

/*
  Tests OpenAPI documentation.
*/

/*
Status codes and headers for both JSON and YAML, when openapi is either disabled or enabled.
*/

const errorResponseSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
} as const

const endpoints = ['/openapi.json', '/openapi.yaml']

// TODO:
// - Sanity check tests voor HTML pagina toevoegen

describe.each(endpoints)('OpenAPI documentation', (path) => {
  test(`When OpenAPI disabled, '${path}' returns a 404`, async () => {
    const tembaServer = createServer({ openapi: false })
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(404)
  })

  test(`When OpenAPI enabled, '${path}' returns a 200 with the content-type header`, async () => {
    const tembaServer = createServer({
      openapi: true,
      resources: ['actors'],
    })
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(200)

    // Check the content type.
    if (path.endsWith('.json')) {
      expect(response.headers['content-type']).toContain('application/json')
    } else {
      expect(response.headers['content-type']).toContain('application/yaml')
    }
  })
})

/*
  The body of the OpenAPI documentation is only tested for JSON, as we may assume that the YAML is correct if the JSON is correct.
*/

test('When no resources configured', async () => {
  const tembaServer = createServer({
    openapi: true,
  })

  const response = await request(tembaServer).get('/openapi.json')
  expect(response.statusCode).toEqual(200)
  // OpenAPI version
  expect(response.body.openapi).toEqual('3.1.0')

  // Info object
  expect(response.body.info.title).toEqual('My API')
  expect(response.body.info.version).toEqual('1.0')
  expect(response.body.info.description).toEqual(
    'This API has been generated using [Temba](https://github.com/bouwe77/temba).',
  )
  expect(response.body.info.license.name).toEqual('Apache 2.0')
  expect(response.body.info.license.url).toEqual('http://www.apache.org/licenses/LICENSE-2.0.html')

  expect(response.body.servers.length).toEqual(1)
  const url = response.body.servers[0].url
  const expected = 'http://127.0.0.1:'
  if (!url.startsWith(expected)) {
    throw new Error(`Expected URL to start with ${expected}, but got: ${url}`)
  }

  // Paths object has 3 paths: "/", "/{resource}" and "/{resource}/{resourceId}"
  expect(Object.keys(response.body.paths).length).toEqual(3)

  // GET /
  const root = response.body.paths['/']['get']
  expect(root.summary).toEqual('API root')
  expect(root.description).toEqual('Shows information about the API.')
  expect(root.operationId).toEqual('getApiRoot')
  expect(root.responses['200'].description).toEqual('The API is working.')
  expect(root.responses['200'].content['text/html'].schema.type).toEqual('string')

  const defaultResponseSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  }

  // GET /{resource}
  const get = response.body.paths['/{resource}']['get']
  expect(get.summary).toEqual('List all resources')
  expect(get.description).toEqual('List all resources.')
  expect(get.operationId).toEqual('getAllResources')
  expect(get.parameters[0].name).toEqual('resource')
  expect(get.parameters[0].in).toEqual('path')
  expect(get.parameters[0].required).toEqual(true)
  expect(get.parameters[0].schema.type).toEqual('string')
  expect(get.parameters[0].description).toEqual('The name of the resource.')
  expect(get.responses['200'].description).toEqual('List of all resources.')
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items).toEqual(
    defaultResponseSchema,
  )

  // GET /{resource}/{resourceId}
  const getById = response.body.paths['/{resource}/{resourceId}']['get']
  expect(getById.summary).toEqual('Find a resource by ID')
  expect(getById.description).toEqual('Find a resource by ID.')
  expect(getById.operationId).toEqual('getResourceById')
  expect(getById.parameters[0].name).toEqual('resource')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The name of the resource.')
  expect(getById.parameters[1].name).toEqual('resourceId')
  expect(getById.parameters[1].in).toEqual('path')
  expect(getById.parameters[1].required).toEqual(true)
  expect(getById.parameters[1].schema.type).toEqual('string')
  expect(getById.parameters[1].description).toEqual('The ID of the resource.')
  expect(getById.responses['200'].description).toEqual('The resource with the resourceId.')
  expect(getById.responses['200'].content['application/json'].schema).toEqual(defaultResponseSchema)
  expect(getById.responses['404'].description).toEqual('The resourceId was not found.')
  expect(getById.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)

  // HEAD /{resource}
  const head = response.body.paths['/{resource}']['head']
  expect(head.summary).toEqual('HTTP headers for all resources')
  expect(head.description).toEqual('Returns HTTP headers for all resources.')
  expect(head.operationId).toEqual('getAllResourcesHeaders')
  expect(head.parameters[0].name).toEqual('resource')
  expect(head.parameters[0].in).toEqual('path')
  expect(head.parameters[0].required).toEqual(true)
  expect(head.parameters[0].schema.type).toEqual('string')
  expect(head.parameters[0].description).toEqual('The name of the resource.')
  expect(head.responses['200'].description).toEqual('HTTP headers for all resources.')

  // HEAD /{resource}/{resourceId}
  const headById = response.body.paths['/{resource}/{resourceId}']['head']
  expect(headById.summary).toEqual('HTTP headers for the resource by ID')
  expect(headById.description).toEqual('Returns HTTP headers for the resource by ID.')
  expect(headById.operationId).toEqual('getResourceByIdHeaders')
  expect(getById.parameters[0].name).toEqual('resource')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The name of the resource.')
  expect(headById.parameters[1].name).toEqual('resourceId')
  expect(headById.parameters[1].in).toEqual('path')
  expect(headById.parameters[1].required).toEqual(true)
  expect(headById.parameters[1].schema.type).toEqual('string')
  expect(headById.parameters[1].description).toEqual('The ID of the resource.')
  expect(headById.responses['200'].description).toEqual(
    'HTTP headers for the resource with the resourceId.',
  )
  expect(headById.responses['404'].description).toEqual('The resourceId was not found.')

  // POST /{resource}
  const post = response.body.paths['/{resource}']['post']
  expect(post.summary).toEqual('Create a new resource')
  expect(post.description).toEqual('Create a new resource.')
  expect(post.operationId).toEqual('createResource')
  expect(post.parameters[0].name).toEqual('resource')
  expect(post.parameters[0].in).toEqual('path')
  expect(post.parameters[0].required).toEqual(true)
  expect(post.parameters[0].schema.type).toEqual('string')
  expect(post.parameters[0].description).toEqual('The name of the resource.')
  expect(post.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(post.responses['201'].description).toEqual(
    'The resource was created. The created resource is returned in the response.',
  )
  expect(post.responses['201'].content['application/json'].schema).toEqual(defaultResponseSchema)
  expect(post.responses['400'].description).toEqual('The request was invalid.')
  expect(post.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // POST /{resource}/{resourceId}
  const postId = response.body.paths['/{resource}/{resourceId}']['post']
  expect(postId.summary).toEqual('Create a new resource with id')
  expect(postId.description).toEqual('Create a new resource, specifying your own id.')
  expect(postId.operationId).toEqual('createResourceWithId')
  expect(postId.parameters[0].name).toEqual('resource')
  expect(postId.parameters[0].in).toEqual('path')
  expect(postId.parameters[0].required).toEqual(true)
  expect(postId.parameters[0].schema.type).toEqual('string')
  expect(postId.parameters[0].description).toEqual('The name of the resource.')
  expect(postId.parameters[1].name).toEqual('resourceId')
  expect(postId.parameters[1].in).toEqual('path')
  expect(postId.parameters[1].required).toEqual(true)
  expect(postId.parameters[1].schema.type).toEqual('string')
  expect(postId.parameters[1].description).toEqual('The ID of the resource.')
  expect(postId.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(postId.responses['201'].description).toEqual(
    'The resource was created. The created resource is returned in the response.',
  )
  expect(postId.responses['201'].content['application/json'].schema.type).toEqual('object')
  expect(postId.responses['400'].description).toEqual('The request was invalid.')
  expect(postId.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(
    postId.responses['400'].content['application/json'].schema.properties.message.type,
  ).toEqual('string')
  expect(
    postId.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')
  expect(
    postId.responses['409'].content['application/json'].examples['IdAlreadyExists'].value.message,
  ).toEqual("ID '{resourceId}' already exists")

  // PUT /{resource}/{resourceId}
  const put = response.body.paths['/{resource}/{resourceId}']['put']
  expect(put.summary).toEqual('Replace a resource')
  expect(put.description).toEqual('Replace a resource.')
  expect(put.operationId).toEqual('replaceResource')
  expect(getById.parameters[0].name).toEqual('resource')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The name of the resource.')
  expect(put.parameters[1].name).toEqual('resourceId')
  expect(put.parameters[1].in).toEqual('path')
  expect(put.parameters[1].required).toEqual(true)
  expect(put.parameters[1].schema.type).toEqual('string')
  expect(put.parameters[1].description).toEqual('The ID of the resource.')
  expect(put.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(put.responses['200'].description).toEqual(
    'The resource was replaced. The replaced resource is returned in the response.',
  )
  expect(put.responses['200'].content['application/json'].schema).toEqual(defaultResponseSchema)
  expect(put.responses['404'].description).toEqual('The resourceId was not found.')
  expect(put.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(put.responses['400'].description).toEqual('The request was invalid.')
  expect(put.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    put.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    put.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PATCH /{resource}/{resourceId}
  const patch = response.body.paths['/{resource}/{resourceId}']['patch']
  expect(patch.summary).toEqual('Update a resource')
  expect(patch.description).toEqual('Update a resource.')
  expect(patch.operationId).toEqual('updateResource')
  expect(getById.parameters[0].name).toEqual('resource')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The name of the resource.')
  expect(patch.parameters[1].name).toEqual('resourceId')
  expect(patch.parameters[1].in).toEqual('path')
  expect(patch.parameters[1].required).toEqual(true)
  expect(patch.parameters[1].schema.type).toEqual('string')
  expect(patch.parameters[1].description).toEqual('The ID of the resource.')
  expect(patch.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['200'].description).toEqual(
    'The resource was updated. The updated resource is returned in the response.',
  )
  expect(patch.responses['200'].content['application/json'].schema).toEqual(defaultResponseSchema)
  expect(patch.responses['404'].description).toEqual('The resourceId was not found.')
  expect(patch.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(patch.responses['400'].description).toEqual('The request was invalid.')
  expect(patch.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    patch.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    patch.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // DELETE /{resource} is disabled, so not in the paths
  const deleteAll = response.body.paths['/{resource}']['delete']
  expect(deleteAll.summary).toEqual('Delete all resources')
  expect(deleteAll.description).toEqual(
    'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
  )
  expect(deleteAll.operationId).toEqual('deleteAllResources')
  expect(deleteAll.parameters[0].name).toEqual('resource')
  expect(deleteAll.parameters[0].in).toEqual('path')
  expect(deleteAll.parameters[0].required).toEqual(true)
  expect(deleteAll.parameters[0].schema.type).toEqual('string')
  expect(deleteAll.parameters[0].description).toEqual('The name of the resource.')
  expect(deleteAll.responses['405'].description).toEqual('Method not allowed')

  // DELETE /{resource}/{resourceId}
  const deleteById = response.body.paths['/{resource}/{resourceId}']['delete']
  expect(deleteById.summary).toEqual('Delete a resource')
  expect(deleteById.description).toEqual('Delete a resource.')
  expect(deleteById.operationId).toEqual('deleteResource')
  expect(getById.parameters[0].name).toEqual('resource')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The name of the resource.')
  expect(deleteById.parameters[1].name).toEqual('resourceId')
  expect(deleteById.parameters[1].in).toEqual('path')
  expect(deleteById.parameters[1].required).toEqual(true)
  expect(deleteById.parameters[1].schema.type).toEqual('string')
  expect(deleteById.parameters[1].description).toEqual('The ID of the resource.')
  expect(deleteById.responses['204'].description).toEqual('The resource was deleted.')
})

test('When a single resource configured', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
  })

  const response = await request(tembaServer).get('/openapi.json')

  // OpenAPI version
  expect(response.body.openapi).toEqual('3.1.0')

  // Info object
  expect(response.body.info.title).toEqual('My API')
  expect(response.body.info.version).toEqual('1.0')
  expect(response.body.info.description).toEqual(
    'This API has been generated using [Temba](https://github.com/bouwe77/temba).',
  )
  expect(response.body.info.license.name).toEqual('Apache 2.0')
  expect(response.body.info.license.url).toEqual('http://www.apache.org/licenses/LICENSE-2.0.html')

  expect(response.body.servers.length).toEqual(1)
  const url = response.body.servers[0].url
  const expected = 'http://127.0.0.1:'
  if (!url.startsWith(expected)) {
    throw new Error(`Expected URL to start with ${expected}, but got: ${url}`)
  }

  // Paths object has 3 paths: "/", "/actors" and "/actors/{actorId}"
  expect(Object.keys(response.body.paths).length).toEqual(3)

  // GET /
  const root = response.body.paths['/']['get']
  expect(root.summary).toEqual('API root')
  expect(root.description).toEqual('Shows information about the API.')
  expect(root.operationId).toEqual('getApiRoot')
  expect(root.responses['200'].description).toEqual('The API is working.')
  expect(root.responses['200'].content['text/html'].schema.type).toEqual('string')

  // GET /actors
  const get = response.body.paths['/actors']['get']
  expect(get.summary).toEqual('List all actors')
  expect(get.description).toEqual('List all actors.')
  expect(get.operationId).toEqual('getAllActors')
  expect(get.responses['200'].description).toEqual('List of all actors.')
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items.type).toEqual('object')

  // GET /actors/{actorId}
  const getById = response.body.paths['/actors/{actorId}']['get']
  expect(getById.summary).toEqual('Find an actor by ID')
  expect(getById.description).toEqual('Find an actor by ID.')
  expect(getById.operationId).toEqual('getActorById')
  expect(getById.parameters[0].name).toEqual('actorId')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The ID of the actor.')
  expect(getById.responses['200'].description).toEqual('The actor with the actorId.')
  expect(getById.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(getById.responses['404'].description).toEqual('The actorId was not found.')
  expect(getById.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)

  // HEAD /actors
  const head = response.body.paths['/actors']['head']
  expect(head.summary).toEqual('HTTP headers for all actors')
  expect(head.description).toEqual('Returns HTTP headers for all actors.')
  expect(head.operationId).toEqual('getAllActorsHeaders')
  expect(head.responses['200'].description).toEqual('HTTP headers for all actors.')

  // HEAD /actors/{actorId}
  const headById = response.body.paths['/actors/{actorId}']['head']
  expect(headById.summary).toEqual('HTTP headers for the actor by ID')
  expect(headById.description).toEqual('Returns HTTP headers for the actor by ID.')
  expect(headById.operationId).toEqual('getActorByIdHeaders')
  expect(headById.parameters[0].name).toEqual('actorId')
  expect(headById.parameters[0].in).toEqual('path')
  expect(headById.parameters[0].required).toEqual(true)
  expect(headById.parameters[0].schema.type).toEqual('string')
  expect(headById.parameters[0].description).toEqual('The ID of the actor.')
  expect(headById.responses['200'].description).toEqual(
    'HTTP headers for the actor with the actorId.',
  )
  expect(headById.responses['404'].description).toEqual('The actorId was not found.')

  // POST /actors
  const post = response.body.paths['/actors']['post']
  expect(post.summary).toEqual('Create a new actor')
  expect(post.description).toEqual('Create a new actor.')
  expect(post.operationId).toEqual('createActor')
  expect(post.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(post.responses['201'].description).toEqual(
    'The actor was created. The created actor is returned in the response.',
  )
  expect(post.responses['201'].content['application/json'].schema.type).toEqual('object')
  expect(post.responses['400'].description).toEqual('The request was invalid.')
  expect(post.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PUT /actors/{actorId}
  const put = response.body.paths['/actors/{actorId}']['put']
  expect(put.summary).toEqual('Replace an actor')
  expect(put.description).toEqual('Replace an actor.')
  expect(put.operationId).toEqual('replaceActor')
  expect(put.parameters[0].name).toEqual('actorId')
  expect(put.parameters[0].in).toEqual('path')
  expect(put.parameters[0].required).toEqual(true)
  expect(put.parameters[0].schema.type).toEqual('string')
  expect(put.parameters[0].description).toEqual('The ID of the actor.')
  expect(put.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(put.responses['200'].description).toEqual(
    'The actor was replaced. The replaced actor is returned in the response.',
  )
  expect(put.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['404'].description).toEqual('The actorId was not found.')
  expect(put.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(put.responses['400'].description).toEqual('The request was invalid.')
  expect(put.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    put.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    put.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PATCH /actors/{actorId}
  const patch = response.body.paths['/actors/{actorId}']['patch']
  expect(patch.summary).toEqual('Update an actor')
  expect(patch.description).toEqual('Update an actor.')
  expect(patch.operationId).toEqual('updateActor')
  expect(patch.parameters[0].name).toEqual('actorId')
  expect(patch.parameters[0].in).toEqual('path')
  expect(patch.parameters[0].required).toEqual(true)
  expect(patch.parameters[0].schema.type).toEqual('string')
  expect(patch.parameters[0].description).toEqual('The ID of the actor.')
  expect(patch.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['200'].description).toEqual(
    'The actor was updated. The updated actor is returned in the response.',
  )
  expect(patch.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['404'].description).toEqual('The actorId was not found.')
  expect(patch.responses['404'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(patch.responses['400'].description).toEqual('The request was invalid.')
  expect(patch.responses['400'].content['application/json'].schema).toEqual(errorResponseSchema)
  expect(
    patch.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    patch.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // DELETE /actors is disabled, so not in the paths
  const deleteAll = response.body.paths['/actors']['delete']
  expect(deleteAll.description).toEqual(
    'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
  )
  expect(deleteAll.operationId).toEqual('deleteAllActors')
  expect(deleteAll.responses['405'].description).toEqual('Method not allowed')

  // DELETE /actors/{actorId}
  const deleteById = response.body.paths['/actors/{actorId}']['delete']
  expect(deleteById.summary).toEqual('Delete an actor')
  expect(deleteById.description).toEqual('Delete an actor.')
  expect(deleteById.operationId).toEqual('deleteActor')
  expect(deleteById.parameters[0].name).toEqual('actorId')
  expect(deleteById.parameters[0].in).toEqual('path')
  expect(deleteById.parameters[0].required).toEqual(true)
  expect(deleteById.parameters[0].schema.type).toEqual('string')
  expect(deleteById.parameters[0].description).toEqual('The ID of the actor.')
  expect(deleteById.responses['204'].description).toEqual('The actor was deleted.')
})

test('When apiPrefix configured server URL contains it', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    apiPrefix: '/api',
  })

  const response = await request(tembaServer).get('/api/openapi.json')
  expect(response.body.servers.length).toEqual(1)
  expect(response.body.servers[0].url).toContain('/api/')
})

test('When allowDeleteCollection is true paths contain a delete for the resource collection', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    allowDeleteCollection: true,
  })

  const response = await request(tembaServer).get('/openapi.json')

  const deleteAll = response.body.paths['/actors']['delete']
  expect(deleteAll.summary).toEqual('Delete all actors')
  expect(deleteAll.operationId).toEqual('deleteAllActors')
  expect(deleteAll.responses['204'].description).toEqual('All actors were deleted.')
})

test('When multiple resources configured', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: [
      'actors',
      {
        resourcePath: 'people',
        singularName: 'person',
        pluralName: 'people',
      },
    ],
  })

  const response = await request(tembaServer).get('/openapi.json')

  // Paths object has 5 paths: "/", "/actors", "/actors/{actorId}", "/people", "/people/{personId}"
  expect(Object.keys(response.body.paths).length).toEqual(5)
  expect(response.body.paths['/actors']).toBeDefined()
  expect(response.body.paths['/actors/{actorId}']).toBeDefined()
  expect(response.body.paths['/people']).toBeDefined()
  expect(response.body.paths['/people/{personId}']).toBeDefined()

  // For the people resource some sanity checks for correct usage of the singular an plural resource names
  const get = response.body.paths['/people']['get']
  expect(get.summary).toEqual('List all people')
  expect(get.operationId).toEqual('getAllPeople')
  expect(get.responses['200'].description).toEqual('List of all people.')

  const getById = response.body.paths['/people/{personId}']['get']
  expect(getById.summary).toEqual('Find a person by ID')
  expect(getById.operationId).toEqual('getPersonById')
  expect(getById.responses['200'].description).toEqual('The person with the personId.')
})

test('When a custom OpenAPI object is configured', async () => {
  const tembaServer = createServer({
    openapi: {
      info: {
        title: 'My custom API title',
      },
      paths: {
        '/actors/{actorId}': {
          get: {
            summary: 'My custom summary',
          },
        },
      },
    },
    resources: ['actors'],
  })

  const response = await request(tembaServer).get('/openapi.json')

  expect(response.body.openapi).toEqual('3.1.0')
  expect(response.body.info.title).toEqual('My custom API title')
  expect(response.body.paths['/actors/{actorId}']['get'].summary).toEqual('My custom summary')
})

test('When returnNullFields is false the response description indicates this', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    returnNullFields: false,
  })

  const response = await request(tembaServer).get('/openapi.json')
  expectSuccess(response)

  // GET /actors
  const get = response.body.paths['/actors']['get']
  expect(get.responses['200'].description).toContain(
    'Any fields with `null` values are omitted in all API responses.',
  )

  // GET /actors/{actorId}
  const getById = response.body.paths['/actors/{actorId}']['get']
  expect(getById.responses['200'].description).toContain(
    'Any fields with `null` values are omitted in all API responses.',
  )

  // POST /actors
  const post = response.body.paths['/actors']['post']
  expect(post.responses['201'].description).toContain(
    'Any fields with `null` values are omitted in all API responses.',
  )

  // PUT /actors/{actorId}
  const put = response.body.paths['/actors/{actorId}']['put']
  expect(put.responses['200'].description).toContain(
    'Any fields with `null` values are omitted in all API responses.',
  )

  // PATCH /actors/{actorId}
  const patch = response.body.paths['/actors/{actorId}']['patch']
  expect(patch.responses['200'].description).toContain(
    'Any fields with `null` values are omitted in all API responses.',
  )
})

test('When schemas are configured these are specified in both requests and responses', async () => {
  const createActorRequestSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      age: { type: 'integer' },
    },
    required: ['name'],
    additionalProperties: false,
  }

  const replaceActorRequestSchema = createActorRequestSchema

  const updateActorRequestSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      age: { type: 'integer' },
    },
    additionalProperties: false,
  }

  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    schemas: {
      actors: {
        post: createActorRequestSchema,
        put: replaceActorRequestSchema,
        patch: updateActorRequestSchema,
      },
    },
  })

  // Note: The response schemas of all methods is based on the POST request schema, even if (for example) the PUT schema would be different for whatever reason.
  // So if the PUT schema would be different, some of the response schemas might not be correct, as these depend on which request you (last) did.

  const expectedActorResponseSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      age: { type: 'integer' },
    },
    required: ['id', 'name'],
    additionalProperties: false,
  }

  const response = await request(tembaServer).get('/openapi.json')
  expectSuccess(response)

  // GET /actors
  const get = response.body.paths['/actors']['get']
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items).toEqual(
    expectedActorResponseSchema,
  )

  // GET /actors/{actorId}
  const getById = response.body.paths['/actors/{actorId}']['get']
  expect(getById.responses['200'].content['application/json'].schema).toEqual(
    expectedActorResponseSchema,
  )

  // POST /actors
  const post = response.body.paths['/actors']['post']
  expect(post.requestBody.content['application/json'].schema).toEqual(createActorRequestSchema)
  expect(post.responses['201'].content['application/json'].schema).toEqual(
    expectedActorResponseSchema,
  )

  // PUT /actors/{actorId}
  const put = response.body.paths['/actors/{actorId}']['put']
  expect(put.requestBody.content['application/json'].schema).toEqual(replaceActorRequestSchema)
  expect(put.responses['200'].content['application/json'].schema).toEqual(
    expectedActorResponseSchema,
  )

  // PATCH /actors/{actorId}
  const patch = response.body.paths['/actors/{actorId}']['patch']
  expect(patch.requestBody.content['application/json'].schema).toEqual(updateActorRequestSchema)
  expect(patch.responses['200'].content['application/json'].schema).toEqual(
    expectedActorResponseSchema,
  )
})
