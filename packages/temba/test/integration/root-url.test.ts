import { test, describe, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

/*
  Tests on the root URL: "/"
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

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

    expect(response.text).toContain('"/openapi.html"')
    expect(response.text).toContain('"/openapi.yaml"')
    expect(response.text).toContain('"/openapi.json"')
  })

  test('GET on root URL returns HTML content with apiPrefix', async () => {
    const response = await request(
      createServer({
        apiPrefix: 'api',
      }),
    )
      .get('/api')
      .set('Accept', 'text/html')
    expect(response.statusCode).toEqual(200)

    expect(response.text).toContain('"/api/openapi.html"')
    expect(response.text).toContain('"/api/openapi.yaml"')
    expect(response.text).toContain('"/api/openapi.json"')
  })
})

describe('Other methods', () => {
  test.each(['POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'])(
    '%s on root URL returns Method Not Allowed error',
    async (method) => {
      const response = await request(tembaServer)[method.toLowerCase()]('/')
      expect(response.statusCode).toEqual(405)
      if (method !== 'HEAD') expect(response.body.message).toEqual('Method Not Allowed')
    },
  )

  test('OPTIONS on root URL returns 200 OK', async () => {
    const response = await request(tembaServer).options('/')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeDefined()
  })
})
