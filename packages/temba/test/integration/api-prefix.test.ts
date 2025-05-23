import { test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

/*
  Tests when configuring the apiPrefix.
*/

// This Temba server is created with an apiPrefix configured
const apiPrefix = 'api'
const tembaServer = await createServer({ apiPrefix })

test('GET on root URL returns 404 Not Found error', async () => {
  const response = await request(tembaServer).get('/')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual('Not Found')
})

test('GET on apiPrefix URL returns welcome text', async () => {
  const response = await request(tembaServer).get('/' + apiPrefix)

  expect(response.statusCode).toEqual(200)
  expect(response.text).toContain('My API')
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

test('GET on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).get('/movies')
  expect(response.statusCode).toEqual(404)
})

test('POST on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).post('/movies')
  expect(response.statusCode).toEqual(404)
})

test('PUT on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).put('/movies')
  expect(response.statusCode).toEqual(404)
})

test('DELETE on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).delete('/movies')
  expect(response.statusCode).toEqual(404)
})

test('PATCH on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).patch('/movies')
  expect(response.statusCode).toEqual(404)
})

test('HEAD on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await request(tembaServer).head('/movies')
  expect(response.statusCode).toEqual(404)
})

test('apiPrefix is equal to resource name', async () => {
  const apiPrefix = 'movies'
  const server = await createServer({ apiPrefix })
  const moviesUrl = `/${apiPrefix}/movies/`

  // Create a movie
  const postResponse = await request(server).post(moviesUrl).send({ title: 'Inception' })
  expect(postResponse.statusCode).toEqual(201)

  const id = postResponse.header.location?.split('/').pop()

  // Check if we can get the movie
  const getResponse = await request(server).get(moviesUrl + id)
  expect(getResponse.statusCode).toEqual(200)
  expect(getResponse.body.title).toEqual('Inception')
})
