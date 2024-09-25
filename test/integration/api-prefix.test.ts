import { test, expect } from 'vitest'
import type { UserConfig } from '../../src/config'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests when configuring the apiPrefix.
*/

// This Temba server is created with an apiPrefix configured
const apiPrefix = 'api'
const tembaServer = createServer({ apiPrefix } satisfies UserConfig)

test('GET on root URL returns 404 Not Found error', async () => {
  const response = await sendRequest(tembaServer, 'get', '/')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual('Not Found')
})

test('GET on apiPrefix URL returns welcome text', async () => {
  const response = await sendRequest(tembaServer, 'get', '/' + apiPrefix)

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('It works! ツ')
})

test('GET on apiPrefix and resource URL returns empty array', async () => {
  const movies = '/' + apiPrefix + '/movies/'

  expect((await sendRequest(tembaServer, 'get', movies)).statusCode).toEqual(200)

  const post = await sendRequest(tembaServer, 'post', movies)
  expect(post.statusCode).toEqual(201)

  const movie = movies + post.body.id

  expect((await sendRequest(tembaServer, 'get', movie)).statusCode).toEqual(200)

  expect((await sendRequest(tembaServer, 'get', movies)).statusCode).toEqual(200)

  expect((await sendRequest(tembaServer, 'put', movie)).statusCode).toEqual(200)

  expect((await sendRequest(tembaServer, 'patch', movie)).statusCode).toEqual(200)

  expect((await sendRequest(tembaServer, 'delete', movie)).statusCode).toEqual(204)
})

test('GET on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'get', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('POST on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'post', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('PUT on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'put', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('DELETE on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'delete', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('PATCH on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'patch', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('HEAD on resource URL without apiPrefix returns 404 Not Found', async () => {
  const response = await sendRequest(tembaServer, 'head', '/movies')
  expect(response.statusCode).toEqual(404)
})

test('apiPrefix is equal to resource name', async () => {
  const apiPrefix = 'movies'
  const server = createServer({ apiPrefix } satisfies UserConfig)
  const moviesUrl = `/${apiPrefix}/movies/`

  // Create a movie
  const postResponse = await sendRequest(server, 'post', moviesUrl, { title: 'Inception' })
  expect(postResponse.statusCode).toEqual(201)

  const id = postResponse.headers['location']?.split('/').pop()

  // Check if we can get the movie
  const getResponse = await sendRequest(server, 'get', moviesUrl + id)
  expect(getResponse.statusCode).toEqual(200)
  expect(getResponse.body.title).toEqual('Inception')
})
