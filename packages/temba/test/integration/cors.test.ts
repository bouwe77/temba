import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { createServer } from './createServer'

/*
  Tests for CORS headers and OPTIONS request handling.
*/

const DEFAULT_ORIGIN = '*'
const DEFAULT_METHODS = 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'
const DEFAULT_HEADERS = 'Content-Type, X-Token'

const expectDefaultCorsHeaders = (headers: Record<string, string>) => {
  expect(headers['access-control-allow-origin']).toEqual(DEFAULT_ORIGIN)
  expect(headers['access-control-allow-methods']).toEqual(DEFAULT_METHODS)
  expect(headers['access-control-allow-headers']).toEqual(DEFAULT_HEADERS)
}

const tembaServer = await createServer()
const tembaServerWithCustomCors = await createServer({
  cors: { origin: 'https://myapp.com' },
})
const tembaServerWithFullCors = await createServer({
  cors: {
    origin: 'https://myapp.com',
    methods: 'GET, POST',
    headers: 'Content-Type, Authorization',
  },
})
const tembaServerWithCredentials = await createServer({
  cors: { credentials: true },
})
const tembaServerWithExposeHeaders = await createServer({
  cors: { exposeHeaders: 'ETag, X-Token' },
})
const tembaServerWithMaxAge = await createServer({
  cors: { maxAge: 86400 },
})

describe('Default CORS headers are present on all response types', () => {
  test('200 response includes CORS headers', async () => {
    const response = await request(tembaServer).get('/movies')
    expect(response.statusCode).toEqual(200)
    expectDefaultCorsHeaders(response.headers as Record<string, string>)
  })

  test('201 response includes CORS headers', async () => {
    const response = await request(tembaServer).post('/movies').send({ title: 'Inception' })
    expect(response.statusCode).toEqual(201)
    expectDefaultCorsHeaders(response.headers as Record<string, string>)
  })

  test('404 response includes CORS headers', async () => {
    const response = await request(tembaServer).get('/movies/nonexistentid')
    expect(response.statusCode).toEqual(404)
    expectDefaultCorsHeaders(response.headers as Record<string, string>)
  })

  test('405 response includes CORS headers', async () => {
    const response = await request(tembaServer).post('/')
    expect(response.statusCode).toEqual(405)
    expectDefaultCorsHeaders(response.headers as Record<string, string>)
  })

  test('204 OPTIONS response includes CORS headers', async () => {
    const response = await request(tembaServer).options('/movies')
    expect(response.statusCode).toEqual(204)
    expectDefaultCorsHeaders(response.headers as Record<string, string>)
  })
})

describe('Default CORS headers do not include optional headers', () => {
  test('credentials header is absent by default', async () => {
    const response = await request(tembaServer).get('/movies')
    expect(response.headers['access-control-allow-credentials']).toBeUndefined()
  })

  test('expose-headers header is absent by default', async () => {
    const response = await request(tembaServer).get('/movies')
    expect(response.headers['access-control-expose-headers']).toBeUndefined()
  })

  test('max-age header is absent by default', async () => {
    const response = await request(tembaServer).options('/movies')
    expect(response.headers['access-control-max-age']).toBeUndefined()
  })
})

describe('OPTIONS requests', () => {
  test('OPTIONS on a resource URL returns 204 No Content', async () => {
    const response = await request(tembaServer).options('/movies')
    expect(response.statusCode).toEqual(204)
    expect(JSON.stringify(response.body)).toEqual('{}')
  })

  test('OPTIONS on root URL returns 204 No Content', async () => {
    const response = await request(tembaServer).options('/')
    expect(response.statusCode).toEqual(204)
    expect(JSON.stringify(response.body)).toEqual('{}')
  })

  test('OPTIONS on any URL returns 204 No Content', async () => {
    const response = await request(tembaServer).options('/whatever/path/here')
    expect(response.statusCode).toEqual(204)
    expect(JSON.stringify(response.body)).toEqual('{}')
  })
})

describe('Configurable CORS headers', () => {
  test('Custom origin is reflected in the response', async () => {
    const response = await request(tembaServerWithCustomCors).get('/movies')
    expect(response.headers['access-control-allow-origin']).toEqual('https://myapp.com')
  })

  test('Custom origin falls back to defaults for methods and headers', async () => {
    const response = await request(tembaServerWithCustomCors).get('/movies')
    expect(response.headers['access-control-allow-methods']).toEqual(DEFAULT_METHODS)
    expect(response.headers['access-control-allow-headers']).toEqual(DEFAULT_HEADERS)
  })

  test('Full custom CORS config overrides all three base headers', async () => {
    const response = await request(tembaServerWithFullCors).get('/movies')
    expect(response.headers['access-control-allow-origin']).toEqual('https://myapp.com')
    expect(response.headers['access-control-allow-methods']).toEqual('GET, POST')
    expect(response.headers['access-control-allow-headers']).toEqual(
      'Content-Type, Authorization',
    )
  })

  test('Custom CORS config is also applied to OPTIONS responses', async () => {
    const response = await request(tembaServerWithCustomCors).options('/movies')
    expect(response.statusCode).toEqual(204)
    expect(response.headers['access-control-allow-origin']).toEqual('https://myapp.com')
  })

  test('Custom CORS config is applied to error responses', async () => {
    const response = await request(tembaServerWithCustomCors).get('/movies/nonexistentid')
    expect(response.statusCode).toEqual(404)
    expect(response.headers['access-control-allow-origin']).toEqual('https://myapp.com')
  })
})

describe('credentials', () => {
  test('credentials: true sends Access-Control-Allow-Credentials: true', async () => {
    const response = await request(tembaServerWithCredentials).get('/movies')
    expect(response.headers['access-control-allow-credentials']).toEqual('true')
  })

  test('credentials: true is also sent on OPTIONS responses', async () => {
    const response = await request(tembaServerWithCredentials).options('/movies')
    expect(response.headers['access-control-allow-credentials']).toEqual('true')
  })
})

describe('exposeHeaders', () => {
  test('exposeHeaders sends Access-Control-Expose-Headers', async () => {
    const response = await request(tembaServerWithExposeHeaders).get('/movies')
    expect(response.headers['access-control-expose-headers']).toEqual('ETag, X-Token')
  })

  test('exposeHeaders is also sent on OPTIONS responses', async () => {
    const response = await request(tembaServerWithExposeHeaders).options('/movies')
    expect(response.headers['access-control-expose-headers']).toEqual('ETag, X-Token')
  })
})

describe('maxAge', () => {
  test('maxAge sends Access-Control-Max-Age as a string', async () => {
    const response = await request(tembaServerWithMaxAge).options('/movies')
    expect(response.headers['access-control-max-age']).toEqual('86400')
  })

  test('maxAge is also sent on non-OPTIONS responses', async () => {
    const response = await request(tembaServerWithMaxAge).get('/movies')
    expect(response.headers['access-control-max-age']).toEqual('86400')
  })
})
