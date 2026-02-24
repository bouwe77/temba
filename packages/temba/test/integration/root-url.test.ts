// @custom-server
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { createServer } from './createServer'

/*
  Tests on the root URL: "/"
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = await createServer()

describe('GET text response on root URL', () => {
  test('GET on root URL returns welcome text', async () => {
    const response = await request(tembaServer).get('/')

    expect(response.statusCode).toEqual(200)
    expect(response.text).toContain('My API')
    expect(response.text).toContain('Powered by Temba')
  })
})

describe('GET HTML response on root URL', () => {
  test('GET on root URL returns HTML content', async () => {
    const response = await request(tembaServer).get('/').set('Accept', 'text/html')
    expect(response.statusCode).toEqual(200)
    expect(response.headers['content-type']).toEqual('text/html')
    expect(response.text).toContain('<title>My API</title>')
    expect(response.text).toContain('<h1>My API</h1>')

    expect(response.text).toContain('Temba')

    expect(response.text).toContain('/openapi.html')
    expect(response.text).toContain('/openapi.yaml')
    expect(response.text).toContain('/openapi.json')
  })

  test('GET on root URL returns HTML content with apiPrefix', async () => {
    const response = await request(
      await createServer({
        apiPrefix: 'api',
      }),
    )
      .get('/api')
      .set('Accept', 'text/html')
    expect(response.statusCode).toEqual(200)

    expect(response.text).toContain('/api/openapi.html')
    expect(response.text).toContain('/api/openapi.yaml')
    expect(response.text).toContain('/api/openapi.json')
  })
})

describe('Other methods', () => {
  test.each(['post', 'put', 'delete', 'patch', 'head'] as const)(
    '%s on root URL returns Method Not Allowed error',
    async (method) => {
      const response = await request(tembaServer)[method]('/')
      expect(response.statusCode).toEqual(405)
      if (method !== 'head') expect(response.body.message).toEqual('Method Not Allowed')
    },
  )

  test('OPTIONS on root URL returns 204 No Content', async () => {
    const response = await request(tembaServer).options('/')
    expect(response.statusCode).toEqual(204)
    expect(JSON.stringify(response.body)).toEqual('{}')
  })
})

describe('Query strings on root URL', () => {
  test('GET /?foo=bar is correctly routed to the root handler', async () => {
    const response = await request(tembaServer).get('/?foo=bar')
    expect(response.statusCode).toEqual(200)
  })

  test('POST /?foo=bar still returns 405 Method Not Allowed', async () => {
    const response = await request(tembaServer).post('/?foo=bar')
    expect(response.statusCode).toEqual(405)
  })
})
