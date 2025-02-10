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
  expect(response.text).toEqual('It works! ツ')
})

test.skip('POST on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).post('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test.skip('PUT on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).put('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test.skip('DELETE on root URL returns Method Not Allowed error', async () => {
  const response = await request(tembaServer).delete('/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})
