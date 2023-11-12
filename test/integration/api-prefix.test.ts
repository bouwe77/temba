import request from 'supertest'
import type { Config } from '../../src/config'
import createServer from './createServer'

/*
  Tests when configuring the apiPrefix.
*/

// This Temba server is created with an apiPrefix configured
const apiPrefix = 'api'
const tembaServer = createServer({ apiPrefix } as unknown as Config)

test('GET on root URL returns 404 Not Found error', async () => {
  const response = await request(tembaServer).get('/')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual('Not Found')
})

test('GET on apiPrefix URL returns welcome text', async () => {
  const response = await request(tembaServer).get('/' + apiPrefix)

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('It works! ツ')
})

test('GET on apiPrefix and resource URL returns empty array', async () => {
  const movies = '/' + apiPrefix + '/movies/'

  expect((await request(tembaServer).get(movies)).statusCode).toEqual(200)

  const post = await request(tembaServer).post(movies)
  expect(post.statusCode).toEqual(201)

  const movie = movies + post.body.id

  expect((await request(tembaServer).get(movie)).statusCode).toEqual(200)

  expect((await request(tembaServer).get(movies)).statusCode).toEqual(200)

  expect((await request(tembaServer).put(movie)).statusCode).toEqual(200)

  expect((await request(tembaServer).patch(movie)).statusCode).toEqual(200)

  expect((await request(tembaServer).delete(movie)).statusCode).toEqual(204)
})

test.each(['get', 'post', 'put', 'delete', 'patch', 'head'])(
  '%s on resource URL without apiPrefix returns 404 Not Found error',
  async (method) => {
    const response = await request(tembaServer)[method]('/movies')
    expect(response.statusCode).toEqual(404)
  },
)

test('apiPrefix is equal to resource name', async () => {
  const apiPrefix = 'movies'
  const server = createServer({ apiPrefix } as unknown as Config)
  const moviesUrl = `/${apiPrefix}/movies/`

  // Create a movie
  const postResponse = await request(server).post(moviesUrl).send({ title: 'Inception' })
  expect(postResponse.statusCode).toEqual(201)

  const id = postResponse.header.location.split('/').pop()

  // Check if we can get the movie
  const getResponse = await request(server).get(moviesUrl + id)
  expect(getResponse.statusCode).toEqual(200)
  expect(getResponse.body.title).toEqual('Inception')
})
