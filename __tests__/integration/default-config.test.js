import request from 'supertest'
import { create } from '../../dist/server.js'

// This Temba server is created with the default configuration, because no config object is passed.
const tembaServer = create()

test('GET on root URL returns welcome text', async () => {
  const response = await request(tembaServer).get('/')

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('It works! ツ')
})

test('POST on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).post('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test('PUT on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).put('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test('DELETE on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).delete('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

// There are so many other HTTP methods, but just check PATCH here only.
test('PATCH on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).patch('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test('An allowed method on an unknown resource returns 404 Not Found', async () => {
  const response = await request(tembaServer).get('/unknown_resource')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual(
    "'unknown_resource' is an unknown resource",
  )
})

test('An not allowed method on an unknown resource returns 405 Method Not Allowed', async () => {
  const response = await request(tembaServer).patch('/unknown_resource')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})
