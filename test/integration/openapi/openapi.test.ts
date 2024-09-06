import { describe, test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'

/*
  Tests OpenAPI documentation.
*/

const endpoints = ['/openapi.json', '/openapi.yaml']

/*
  Status codes and headers for both JSON and YAML, when openapi is either disabled or enabled.
*/

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
    const tembaServer = createServer({ openapi: true, resources: ['movies'] } satisfies UserConfig)
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(200)

    // Check the content type.
    if (path.endsWith('.json')) {
      expect(response.headers['content-type']).toContain('application/json')
    } else {
      expect(response.headers['content-type']).toContain('application/yaml')
    }
  })

  test(`When OpenAPI enabled '${path}' but no resources configured returns a 404`, async () => {
    const tembaServer = createServer({ openapi: true } satisfies UserConfig)
    const response = await request(tembaServer).get(path)

    expect(response.statusCode).toEqual(404)
  })
})

/*
  The body of the OpenAPI documentation is only tested for JSON, as we may assume that the YAML is correct if the JSON is correct.
*/

test('OpenAPI when a single resource configured', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['movies'],
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

  // Paths object has 3 paths: "/", "/movies" and "/movies/{movieId}"
  expect(Object.keys(response.body.paths).length).toEqual(3)

  // GET /
  const root = response.body.paths['/']['get']
  expect(root.summary).toEqual('API root')
  expect(root.operationId).toEqual('getApiRoot')
  expect(root.responses['200'].description).toEqual('The API is working.')
  expect(root.responses['200'].content['text/html'].schema.type).toEqual('string')

  // GET /movies
  const get = response.body.paths['/movies']['get']
  expect(get.summary).toEqual('List all movies.')
  expect(get.operationId).toEqual('getAllMovies')
  expect(get.responses['200'].description).toEqual('List of all movies.')
  expect(get.responses['200'].content['application/json'].schema.type).toEqual('array')
  expect(get.responses['200'].content['application/json'].schema.items.type).toEqual('object')

  // GET /movies/{movieId}
  const getById = response.body.paths['/movies/{movieId}']['get']
  expect(getById.summary).toEqual('Find a movie by ID')
  expect(getById.operationId).toEqual('getMovieById')
  expect(getById.parameters[0].name).toEqual('movieId')
  expect(getById.parameters[0].in).toEqual('path')
  expect(getById.parameters[0].required).toEqual(true)
  expect(getById.parameters[0].schema.type).toEqual('string')
  expect(getById.parameters[0].description).toEqual('The ID of the movie.')
  expect(getById.responses['200'].description).toEqual('The movie with the movieId.')
  expect(getById.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(getById.responses['404'].description).toEqual('The movieId was not found.')
  expect(getById.responses['404'].content['application/json'].schema.type).toEqual('object')
  expect(
    getById.responses['404'].content['application/json'].schema.properties.message.type,
  ).toEqual('string')

  // HEAD /movies
  const head = response.body.paths['/movies']['head']
  expect(head.summary).toEqual('Returns HTTP headers for the list of movies.')
  expect(head.operationId).toEqual('getAllMoviesHeaders')
  expect(head.responses['200'].description).toEqual('HTTP headers for the list of all movies.')

  // HEAD /movies/{movieId}
  const headById = response.body.paths['/movies/{movieId}']['head']
  expect(headById.summary).toEqual('Returns HTTP headers for the movie by ID.')
  expect(headById.operationId).toEqual('getMovieByIdHeaders')
  expect(headById.parameters[0].name).toEqual('movieId')
  expect(headById.parameters[0].in).toEqual('path')
  expect(headById.parameters[0].required).toEqual(true)
  expect(headById.parameters[0].schema.type).toEqual('string')
  expect(headById.parameters[0].description).toEqual('The ID of the movie.')
  expect(headById.responses['200'].description).toEqual(
    'HTTP headers for the movie with the movieId.',
  )
  expect(headById.responses['404'].description).toEqual('The movieId was not found.')

  // POST /movies
  const post = response.body.paths['/movies']['post']
  expect(post.summary).toEqual('Create a new movie.')
  expect(post.operationId).toEqual('createMovie')
  expect(post.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(post.responses['201'].description).toEqual(
    'The movie was created. The created movie is returned in the response.',
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

  // PUT /movies/{movieId}
  const put = response.body.paths['/movies/{movieId}']['put']
  expect(put.summary).toEqual('Replace a movie.')
  expect(put.operationId).toEqual('replaceMovie')
  expect(put.parameters[0].name).toEqual('movieId')
  expect(put.parameters[0].in).toEqual('path')
  expect(put.parameters[0].required).toEqual(true)
  expect(put.parameters[0].schema.type).toEqual('string')
  expect(put.parameters[0].description).toEqual('The ID of the movie.')
  expect(put.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(put.responses['200'].description).toEqual(
    'The movie was replaced. The replaced movie is returned in the response.',
  )
  expect(put.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(put.responses['404'].description).toEqual('The movieId was not found.')
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

  // PATCH /movies/{movieId}
  const patch = response.body.paths['/movies/{movieId}']['patch']
  expect(patch.summary).toEqual('Update a movie.')
  expect(patch.operationId).toEqual('updateMovie')
  expect(patch.parameters[0].name).toEqual('movieId')
  expect(patch.parameters[0].in).toEqual('path')
  expect(patch.parameters[0].required).toEqual(true)
  expect(patch.parameters[0].schema.type).toEqual('string')
  expect(patch.parameters[0].description).toEqual('The ID of the movie.')
  expect(patch.requestBody.content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['200'].description).toEqual(
    'The movie was updated. The updated movie is returned in the response.',
  )
  expect(patch.responses['200'].content['application/json'].schema.type).toEqual('object')
  expect(patch.responses['404'].description).toEqual('The movieId was not found.')
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

  // DELETE /movies is disabled, so not in the paths
  const deleteAll = response.body.paths['/movies']['delete']
  expect(deleteAll.summary).toEqual(
    'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
  )
  expect(deleteAll.operationId).toEqual('deleteAllMovies')
  expect(deleteAll.responses['405'].description).toEqual('Method not allowed')

  // DELETE /movies/{movieId}
  const deleteById = response.body.paths['/movies/{movieId}']['delete']
  expect(deleteById.summary).toEqual('Delete a movie.')
  expect(deleteById.operationId).toEqual('deleteMovie')
  expect(deleteById.parameters[0].name).toEqual('movieId')
  expect(deleteById.parameters[0].in).toEqual('path')
  expect(deleteById.parameters[0].required).toEqual(true)
  expect(deleteById.parameters[0].schema.type).toEqual('string')
  expect(deleteById.parameters[0].description).toEqual('The ID of the movie.')
  expect(deleteById.responses['204'].description).toEqual('The movie was deleted.')
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
    resources: ['movies'],
    apiPrefix: '/api',
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  expect(response.body.servers.length).toEqual(1)
  expect(response.body.servers[0].url).toContain('/api/')
})

test('OpenAPI paths contains deleting a collection when allowDeleteCollection is true', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['movies'],
    allowDeleteCollection: true,
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  const deleteAll = response.body.paths['/movies']['delete']
  expect(deleteAll.summary).toEqual('Delete all movies.')
  expect(deleteAll.operationId).toEqual('deleteAllMovies')
  expect(deleteAll.responses['204'].description).toEqual('All movies were deleted.')
})

test('OpenAPI when multiple resources configured', async () => {
  const tembaServer = createServer({
    openapi: true,
    resources: ['movies', 'actors'],
  } satisfies UserConfig)

  const response = await request(tembaServer).get('/openapi.json')

  // Paths object has 5 paths: "/", "/movies", "/movies/{movieId}", "/actors", "/actors/{actorId}"
  expect(Object.keys(response.body.paths).length).toEqual(5)
})
