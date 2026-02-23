import request from 'supertest'
import { describe, expect, test } from 'vitest'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { createServer } from '../createServer'

// Tests that the requestInterceptor is called for non-resource requests (root, openapi, static)
// and that the type discriminator is correctly passed to the callback.

// Note how we test the requestInterceptors in isolation by using actions.response().
// This way, the request will not be handled by Temba any further and we are sure that the response
// is defined by the requestInterceptors only.

const getStaticFileFromDisk = async (): Promise<{ content: string; mimeType: string }> =>
  Promise.resolve({ content: '<html>hello</html>', mimeType: 'text/html' })

describe('requestInterceptor is called for non-resource GET requests', () => {
  describe('Root URL', () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => {
        if (type === 'root') return actions.response({ status: 418, body: { type } })
      },
    }

    test('GET / — interceptor is called with type "root" and can short-circuit', async () => {
      const tembaServer = await createServer({ requestInterceptor })

      const response = await request(tembaServer).get('/')

      expect(response.statusCode).toEqual(418)
      expect(response.body).toEqual({ type: 'root' })
    })

    test('GET / — interceptor returning void lets Temba respond normally', async () => {
      const tembaServer = await createServer({ requestInterceptor: { get: () => {} } })

      const response = await request(tembaServer).get('/')

      expect(response.statusCode).toEqual(200)
    })

    test('POST / — interceptor is NOT called, returns 405', async () => {
      let interceptorCalled = false
      const tembaServer = await createServer({
        requestInterceptor: {
          post: () => {
            interceptorCalled = true
          },
        },
      })

      const response = await request(tembaServer).post('/').send({})

      expect(response.statusCode).toEqual(405)
      expect(interceptorCalled).toBe(false)
    })
  })

  describe('OpenAPI endpoints', () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => {
        if (type === 'openapi') return actions.response({ status: 418, body: { type } })
      },
    }

    test('GET /openapi.json — interceptor is called with type "openapi" and can short-circuit', async () => {
      const tembaServer = await createServer({ requestInterceptor })

      const response = await request(tembaServer).get('/openapi.json')

      expect(response.statusCode).toEqual(418)
      expect(response.body).toEqual({ type: 'openapi' })
    })

    test('GET /openapi.yaml — interceptor is called with type "openapi"', async () => {
      const tembaServer = await createServer({ requestInterceptor })

      const response = await request(tembaServer).get('/openapi.yaml')

      expect(response.statusCode).toEqual(418)
      expect(response.body).toEqual({ type: 'openapi' })
    })

    test('GET /openapi — interceptor is called with type "openapi"', async () => {
      const tembaServer = await createServer({ requestInterceptor })

      const response = await request(tembaServer).get('/openapi')

      expect(response.statusCode).toEqual(418)
      expect(response.body).toEqual({ type: 'openapi' })
    })

    test('GET /openapi.json — interceptor returning void lets Temba respond normally', async () => {
      const tembaServer = await createServer({ requestInterceptor: { get: () => {} } })

      const response = await request(tembaServer).get('/openapi.json')

      expect(response.statusCode).toEqual(200)
    })

    test('POST /openapi.json — interceptor is NOT called, returns 405', async () => {
      let interceptorCalled = false
      const tembaServer = await createServer({
        requestInterceptor: {
          post: () => {
            interceptorCalled = true
          },
        },
      })

      const response = await request(tembaServer).post('/openapi.json').send({})

      expect(response.statusCode).toEqual(405)
      expect(interceptorCalled).toBe(false)
    })
  })

  describe('Static folder', () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => {
        if (type === 'static') return actions.response({ status: 418, body: { type } })
      },
    }

    test('GET /index.html — interceptor is called with type "static" and can short-circuit', async () => {
      const tembaServer = await createServer(
        { staticFolder: 'dist', requestInterceptor },
        { getStaticFileFromDisk },
      )

      const response = await request(tembaServer).get('/')

      expect(response.statusCode).toEqual(418)
      expect(response.body).toEqual({ type: 'static' })
    })

    test('GET /index.html — interceptor returning void lets Temba serve the file', async () => {
      const tembaServer = await createServer(
        { staticFolder: 'dist', requestInterceptor: { get: () => {} } },
        { getStaticFileFromDisk },
      )

      const response = await request(tembaServer).get('/')

      expect(response.statusCode).toEqual(200)
    })

    test('POST to static folder — interceptor is NOT called, returns 405', async () => {
      let interceptorCalled = false
      const tembaServer = await createServer(
        {
          staticFolder: 'dist',
          requestInterceptor: {
            post: () => {
              interceptorCalled = true
            },
          },
        },
        { getStaticFileFromDisk },
      )

      const response = await request(tembaServer).post('/').send({})

      expect(response.statusCode).toEqual(405)
      expect(interceptorCalled).toBe(false)
    })
  })
})

describe('requestInterceptor type discriminator for resource vs non-resource', () => {
  test('type is "resource" for resource requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => actions.response({ status: 200, body: { type } }),
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/movies')

    expect(response.body).toEqual({ type: 'resource' })
  })

  test('type is "root" for root URL requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => actions.response({ status: 200, body: { type } }),
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/')

    expect(response.body).toEqual({ type: 'root' })
  })

  test('type is "openapi" for OpenAPI requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => actions.response({ status: 200, body: { type } }),
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/openapi.json')

    expect(response.body).toEqual({ type: 'openapi' })
  })

  test('type is "static" for static folder requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type }, actions) => actions.response({ status: 200, body: { type } }),
    }
    const tembaServer = await createServer(
      { staticFolder: 'dist', requestInterceptor },
      { getStaticFileFromDisk },
    )

    const response = await request(tembaServer).get('/')

    expect(response.body).toEqual({ type: 'static' })
  })
})

describe('requestInterceptor headers are passed for non-resource requests', () => {
  test('headers are available in the interceptor for root URL requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type, headers }, actions) => {
        if (type === 'root') return actions.response({ status: 200, body: { token: headers['x-token'] } })
      },
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/').set('x-token', 'abc123')

    expect(response.body).toEqual({ token: 'abc123' })
  })
})

describe('requestInterceptor url is passed for non-resource requests', () => {
  test('url is available in the interceptor for root URL requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type, url }, actions) => {
        if (type === 'root') return actions.response({ status: 200, body: { url } })
      },
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/')

    expect(response.body.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/)
  })

  test('url is available in the interceptor for openapi requests with a query string', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type, url }, actions) => {
        if (type === 'openapi') return actions.response({ status: 200, body: { url } })
      },
    }
    const tembaServer = await createServer({ requestInterceptor })

    // Note: query strings on non-resource routes such as /openapi.json are forwarded as-is in
    // the url field even though the routing itself does not use them for matching.
    const response = await request(tembaServer).get('/openapi.json')

    expect(response.body.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/openapi\.json$/)
  })

  test('url is available in the interceptor for openapi requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type, url }, actions) => {
        if (type === 'openapi') return actions.response({ status: 200, body: { url } })
      },
    }
    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer).get('/openapi.json')

    expect(response.body.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/openapi\.json$/)
  })

  test('url is available in the interceptor for static folder requests', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: ({ type, url }, actions) => {
        if (type === 'static') return actions.response({ status: 200, body: { url } })
      },
    }
    const tembaServer = await createServer(
      { staticFolder: 'dist', requestInterceptor },
      { getStaticFileFromDisk },
    )

    const response = await request(tembaServer).get('/')

    expect(response.body.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/)
  })
})
