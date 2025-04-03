import { test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

/*
  Tests on the root URL: "/"
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

test('GET on root URL returns welcome text', async () => {
  const response = await request(tembaServer).get('/')

  expect(response.statusCode).toEqual(200)
  expect(response.text).toContain('My API')
})

test('GET on root URL returns HTML content', async () => {
  const response = await request(tembaServer).get('/').set('Accept', 'text/html')
  expect(response.statusCode).toEqual(200)
  expect(response.headers['content-type']).toEqual('text/html')
  expect(response.text).toContain('<title>My API</title>')
  expect(response.text).toContain('<h1>My API</h1>')
  expect(response.text).toContain('Temba')
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
