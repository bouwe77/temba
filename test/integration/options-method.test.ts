import { test, expect } from 'vitest'
import request from 'supertest'
import createServer from './createServer'
import express from 'express'

/*
  Tests for OPTIONS requests
*/

const tembaServer = createServer()

const customRouter = express.Router()
customRouter.get('/hello', async (_, res) => {
  return res.send('Hello, World!')
})

// The bottom line of Express' behavior for OPTIONS requests
// is that it always returns the same methods, unless you implement
// your own OPTIONS handler.
//
// So for Temba this means the OPTIONS request is not "supported",
// looking at allowed methods. For CORS purposes, Express' default
// seems sufficient though.

test('OPTIONS', async () => {
  const optionsRootResponse = await request(tembaServer).options('/')
  expect(optionsRootResponse.status).toBe(204)
  expect(optionsRootResponse.header['access-control-allow-methods']).toBe(
    'GET,HEAD,PUT,PATCH,POST,DELETE',
  )

  // Even though we only have a GET route for /hello, the OPTIONS response
  // returns all methods that exists, because that's Express' default behavior.
  const optionsHelloResponse = await request(tembaServer).options('/hello')
  expect(optionsHelloResponse.status).toBe(204)
  expect(optionsHelloResponse.header['access-control-allow-methods']).toBe(
    'GET,HEAD,PUT,PATCH,POST,DELETE',
  )
})
