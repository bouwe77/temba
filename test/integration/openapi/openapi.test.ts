import { describe, test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'

/*
  Tests OpenAPI documentation.
*/

/*
Status codes and headers for both JSON and YAML, when openapi is either disabled or enabled.
*/

const endpoints = ['/openapi.json', '/openapi.yaml']

describe.each(endpoints)('OpenAPI documentation', (path) => {
  test(`When OpenAPI not configured '${path}' returns a 404`, async () => {
    const tembaServer = createServer()
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(404)
  })

  test(`When OpenAPI disabled '${path}' returns a 404`, async () => {
    const tembaServer = createServer({ openapi: false } satisfies UserConfig)
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(404)
  })

  test(`When OpenAPI enabled '${path}' returns a 200 with the content-type header`, async () => {
    const tembaServer = createServer({ openapi: true, resources: ['actors'] } satisfies UserConfig)
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

test('OpenAPI when no resources configured', async () => {
  const tembaServer = createServer({
    openapi: true,
  } satisfies UserConfig)

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
  expect(response.body.servers[0].url.length).toBeGreaterThan(0)

  // Paths object has 3 paths: "/", "/{resource}" and "/{resource}/{resourceId}"
  expect(Object.keys(response.body.paths).length).toEqual(3)

  // GET /
  const root = response.body.paths['/']['get']
  expect(root.summary).toEqual('API root')
  expect(root.operationId).toEqual('getApiRoot')
  expect(root.responses['200'].description).toEqual('The API is working.')
  expect(root.responses['200'].content['text/html'].schema.type).toEqual('string')

  // GET /{resource}
  const get = response.body.paths['/{resource}']['get']
  expect(get.summary).toEqual('List all resources.')
  expect(get.operationId).toEqual('getAllResources')
  expect(get.parameters[0].name).toEqual('resource')
  expect(get.parameters[0].in).toEqual('path')
  expect(get.parameters[0].required).toEqual(true)
  expect(get.parameters[0].schema.type).toEqual('string')
  expect(get.parameters[0].description).toEqual('The name of the resource.')
  expect(get.responses['200'].description).toEqual('List of all resources.')
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items.type).toEqual('object')

  // GET /{resource}/{resourceId}
  const getById = response.body.paths['/{resource}/{resourceId}']['get']
  expect(getById.summary).toEqual('Find a resource by ID')
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
  expect(getById.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(getById.responses['404'].description).toEqual('The resourceId was not found.')
  expect(getById.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(
    getById.responses['404'].content['application/json'].schema.properties.message.type,
  ).toEqual('string')

  // HEAD /{resource}
  const head = response.body.paths['/{resource}']['head']
  expect(head.summary).toEqual('Returns HTTP headers for the list of resources.')
  expect(head.operationId).toEqual('getAllResourcesHeaders')
  expect(head.parameters[0].name).toEqual('resource')
  expect(head.parameters[0].in).toEqual('path')
  expect(head.parameters[0].required).toEqual(true)
  expect(head.parameters[0].schema.type).toEqual('string')
  expect(head.parameters[0].description).toEqual('The name of the resource.')
  expect(head.responses['200'].description).toEqual('HTTP headers for the list of all resources.')

  // HEAD /{resource}/{resourceId}
  const headById = response.body.paths['/{resource}/{resourceId}']['head']
  expect(headById.summary).toEqual('Returns HTTP headers for the resource by ID.')
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
  expect(post.summary).toEqual('Create a new resource.')
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
  expect(post.responses['201'].content['application/json'].schema.type).toEqual('object')
  expect(post.responses['400'].description).toEqual('The request was invalid.')
  expect(post.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(post.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInUrl'].value.message,
  ).toEqual('An id is not allowed in the URL')
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PUT /{resource}/{resourceId}
  const put = response.body.paths['/{resource}/{resourceId}']['put']
  expect(put.summary).toEqual('Replace a resource.')
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
  expect(put.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['404'].description).toEqual('The resourceId was not found.')
  expect(put.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['404'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(put.responses['400'].description).toEqual('The request was invalid.')
  expect(put.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    put.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    put.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PATCH /{resource}/{resourceId}
  const patch = response.body.paths['/{resource}/{resourceId}']['patch']
  expect(patch.summary).toEqual('Update a resource.')
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
  expect(patch.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['404'].description).toEqual('The resourceId was not found.')
  expect(patch.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['404'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(patch.responses['400'].description).toEqual('The request was invalid.')
  expect(patch.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    patch.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    patch.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // DELETE /{resource} is disabled, so not in the paths
  const deleteAll = response.body.paths['/{resource}']['delete']
  expect(deleteAll.summary).toEqual(
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
  expect(deleteById.summary).toEqual('Delete a resource.')
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

test('OpenAPI when a single resource configured', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
  } satisfies UserConfig)

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
  expect(response.body.servers[0].url.length).toBeGreaterThan(0)

  // Paths object has 3 paths: "/", "/actors" and "/actors/{actorId}"
  expect(Object.keys(response.body.paths).length).toEqual(3)

  // GET /
  const root = response.body.paths['/']['get']
  expect(root.summary).toEqual('API root')
  expect(root.operationId).toEqual('getApiRoot')
  expect(root.responses['200'].description).toEqual('The API is working.')
  expect(root.responses['200'].content['text/html'].schema.type).toEqual('string')

  // GET /actors
  const get = response.body.paths['/actors']['get']
  expect(get.summary).toEqual('List all actors.')
  expect(get.operationId).toEqual('getAllActors')
  expect(get.responses['200'].description).toEqual('List of all actors.')
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items.type).toEqual('object')

  // GET /actors/{actorId}
  const getById = response.body.paths['/actors/{actorId}']['get']
  expect(getById.summary).toEqual('Find an actor by ID')
  expect(getById.operationId).toEqual('getActorById')
  expect(getById.parameters[0].name).toEqual('actorId')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The ID of the actor.')
  expect(getById.responses['200'].description).toEqual('The actor with the actorId.')
  expect(getById.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(getById.responses['404'].description).toEqual('The actorId was not found.')
  expect(getById.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(
    getById.responses['404'].content['application/json'].schema.properties.message.type,
  ).toEqual('string')

  // HEAD /actors
  const head = response.body.paths['/actors']['head']
  expect(head.summary).toEqual('Returns HTTP headers for the list of actors.')
  expect(head.operationId).toEqual('getAllActorsHeaders')
  expect(head.responses['200'].description).toEqual('HTTP headers for the list of all actors.')

  // HEAD /actors/{actorId}
  const headById = response.body.paths['/actors/{actorId}']['head']
  expect(headById.summary).toEqual('Returns HTTP headers for the actor by ID.')
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
  expect(post.summary).toEqual('Create a new actor.')
  expect(post.operationId).toEqual('createActor')
  expect(post.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(post.responses['201'].description).toEqual(
    'The actor was created. The created actor is returned in the response.',
  )
  expect(post.responses['201'].content['application/json'].schema.type).toEqual('object')
  expect(post.responses['400'].description).toEqual('The request was invalid.')
  expect(post.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(post.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInUrl'].value.message,
  ).toEqual('An id is not allowed in the URL')
  expect(
    post.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PUT /actors/{actorId}
  const put = response.body.paths['/actors/{actorId}']['put']
  expect(put.summary).toEqual('Replace an actor.')
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
  expect(put.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['404'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(put.responses['400'].description).toEqual('The request was invalid.')
  expect(put.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    put.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    put.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // PATCH /actors/{actorId}
  const patch = response.body.paths['/actors/{actorId}']['patch']
  expect(patch.summary).toEqual('Update an actor.')
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
  expect(patch.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['404'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(patch.responses['400'].description).toEqual('The request was invalid.')
  expect(patch.responses['400'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['400'].content['application/json'].schema.properties.message.type).toEqual(
    'string',
  )
  expect(
    patch.responses['400'].content['application/json'].examples['MissingIdInUrl'].value.message,
  ).toEqual('An id is required in the URL')
  expect(
    patch.responses['400'].content['application/json'].examples['IdNotAllowedInRequestBody'].value
      .message,
  ).toEqual('An id is not allowed in the request body')

  // DELETE /actors is disabled, so not in the paths
  const deleteAll = response.body.paths['/actors']['delete']
  expect(deleteAll.summary).toEqual(
    'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
  )
  expect(deleteAll.operationId).toEqual('deleteAllActors')
  expect(deleteAll.responses['405'].description).toEqual('Method not allowed')

  // DELETE /actors/{actorId}
  const deleteById = response.body.paths['/actors/{actorId}']['delete']
  expect(deleteById.summary).toEqual('Delete an actor.')
  expect(deleteById.operationId).toEqual('deleteActor')
  expect(deleteById.parameters[0].name).toEqual('actorId')
  expect(deleteById.parameters[0].in).toEqual('path')
  expect(deleteById.parameters[0].required).toEqual(true)
  expect(deleteById.parameters[0].schema.type).toEqual('string')
  expect(deleteById.parameters[0].description).toEqual('The ID of the actor.')
  expect(deleteById.responses['204'].description).toEqual('The actor was deleted.')
})

// TODO: If no resources are configured, the resource name in the paths should be "{resource}", and become
// an extra parameter in the parameters array, with a description that it should be replaced with the actual
// resource name. Also, some extra description text explaining you can send whatever crap you want, and
// that generating client code might not work as expected. See also: https://chatgpt.com/share/30a4f046-9422-4a66-8ee9-b1aeadd1f3ae

// TODO The openapi setting is a boolean for now, but could also become an object to override/expand
// the OpenAPI spec. In that case, the configured OpenAPI spec should be merged with the default spec

// TODO From the resources string array resource names, also singular and plural names are determined.
// As an alternative, when this does not give the desired result, the resources array could be a combi of
// strings and objects, so you can specify the singular and plural names.

// TODO staticFolder config should be its own path with a description and/or summary

// TODO the customRouter setting could override resources, so either remove those resources from the paths,
// or just display a summary saying it's custom. But at least for now, don't describe anything else, as we
// can not really know what the router is doing...

// TODO returnNullFields should be mentioned as a remark

// TODO: The etags setting should be reflected

// TODO: The schemas setting should be reflected: Although we can not know what the exact 400 Bad Request error message will be

test('Server URL contains the configured apiPrefix', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    apiPrefix: '/api',
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  expect(response.body.servers.length).toEqual(1)
  expect(response.body.servers[0].url).toContain('/api/')
})

test('OpenAPI paths contains deleting a collection when allowDeleteCollection is true', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['actors'],
    allowDeleteCollection: true,
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  const deleteAll = response.body.paths['/actors']['delete']
  expect(deleteAll.summary).toEqual('Delete all actors.')
  expect(deleteAll.operationId).toEqual('deleteAllActors')
  expect(deleteAll.responses['204'].description).toEqual('All actors were deleted.')
})

test('OpenAPI when multiple resources configured', async () => {
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
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  // Paths object has 5 paths: "/", "/actors", "/actors/{actorId}", "/people", "/people/{personId}"
  expect(Object.keys(response.body.paths).length).toEqual(5)
  expect(response.body.paths['/actors']).toBeDefined()
  expect(response.body.paths['/actors/{actorId}']).toBeDefined()
  expect(response.body.paths['/people']).toBeDefined()
  expect(response.body.paths['/people/{personId}']).toBeDefined()

  // For the people resource some sanity checks for correct usage of the singular an plural resource names
  const get = response.body.paths['/people']['get']
  expect(get.summary).toEqual('List all people.')
  expect(get.operationId).toEqual('getAllPeople')
  expect(get.responses['200'].description).toEqual('List of all people.')

  const getById = response.body.paths['/people/{personId}']['get']
  expect(getById.summary).toEqual('Find a person by ID')
  expect(getById.operationId).toEqual('getPersonById')
  expect(getById.responses['200'].description).toEqual('The person with the personId.')
})