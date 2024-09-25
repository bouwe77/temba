import { test, expect } from 'vitest'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests on the root URL: "/"
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

test('GET on root URL returns welcome text', async () => {
  const response = await sendRequest(tembaServer, 'get', '/')

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('It works! ツ')
})

test('hondenstront POST on root URL returns Method Not Allowed error', async () => {
  const response = await sendRequest(tembaServer, 'post', '/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test('PUT on root URL returns Method Not Allowed error', async () => {
  const response = await sendRequest(tembaServer, 'put', '/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})

test('DELETE on root URL returns Method Not Allowed error', async () => {
  const response = await sendRequest(tembaServer, 'delete', '/')

  expect(response.statusCode).toEqual(405)
  expect(response.body.message).toEqual('Method Not Allowed')
})
