// @custom-server
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { createServer } from '../createServer'

describe('requestInterceptor with actions.response() for custom responses', () => {
  describe('POST interceptor returning custom responses', async () => {
    const requestInterceptor: RequestInterceptor = {
      post: ({ resource }, actions) => {
        if (resource === 'blocked') {
          return actions.response({ status: 403, body: { error: 'Forbidden' } })
        }
        if (resource === 'no-content') {
          return actions.response({ status: 204 })
        }
        if (resource === 'custom-success') {
          return actions.response({ body: { result: 'custom', id: 'fake-id' } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('POST returns 403 with custom error body', async () => {
      const response = await request(tembaServer).post('/blocked').send({ title: 'Test' })

      expect(response.statusCode).toEqual(403)
      expect(response.body).toEqual({ error: 'Forbidden' })
    })

    test('POST returns 204 with no content', async () => {
      const response = await request(tembaServer).post('/no-content').send({ title: 'Test' })

      expect(response.statusCode).toEqual(204)
      expect(response.body).toEqual({})
    })

    test('POST returns custom 200 response without saving to DB', async () => {
      const response = await request(tembaServer).post('/custom-success').send({ title: 'Test' })

      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual({ result: 'custom', id: 'fake-id' })

      // Verify the item was not actually saved
      const getResponse = await request(tembaServer).get('/custom-success/fake-id')
      expect(getResponse.statusCode).toEqual(404)
    })
  })

  describe('GET interceptor returning custom responses', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: (request, actions) => {
        if (request.type !== 'resource') return
        const { resource, id } = request
        if (resource === 'cached' && id === 'cached-id') {
          return actions.response({
            status: 200,
            body: { id: 'cached-id', name: 'Cached Item' },
          })
        }
        if (resource === 'unauthorized') {
          return actions.response({ status: 401, body: { error: 'Unauthorized' } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('GET returns custom cached response', async () => {
      const response = await request(tembaServer).get('/cached/cached-id')

      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual({ id: 'cached-id', name: 'Cached Item' })
    })

    test('GET returns 401 unauthorized', async () => {
      const response = await request(tembaServer).get('/unauthorized')

      expect(response.statusCode).toEqual(401)
      expect(response.body).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('PUT interceptor returning custom responses', async () => {
    const requestInterceptor: RequestInterceptor = {
      put: ({ resource, id }, actions) => {
        if (resource === 'readonly' || id === 'protected-id') {
          return actions.response({ status: 405, body: { error: 'Method Not Allowed' } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('PUT returns 405 for protected resource', async () => {
      const response = await request(tembaServer).put('/readonly/some-id').send({ title: 'Test' })

      expect(response.statusCode).toEqual(405)
      expect(response.body).toEqual({ error: 'Method Not Allowed' })
    })

    test('PUT returns 405 for protected id', async () => {
      const response = await request(tembaServer)
        .put('/movies/protected-id')
        .send({ title: 'Test' })

      expect(response.statusCode).toEqual(405)
      expect(response.body).toEqual({ error: 'Method Not Allowed' })
    })
  })

  describe('PATCH interceptor returning custom responses', async () => {
    const requestInterceptor: RequestInterceptor = {
      patch: ({ body }, actions) => {
        if (body && typeof body === 'object' && 'invalid' in body) {
          return actions.response({ status: 400, body: { error: 'Invalid field' } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('PATCH returns 400 for invalid field', async () => {
      // First create an item
      const createResponse = await request(tembaServer).post('/items').send({ name: 'Item' })
      const id = createResponse.body.id

      // Try to patch with invalid field
      const response = await request(tembaServer).patch(`/items/${id}`).send({ invalid: true })

      expect(response.statusCode).toEqual(400)
      expect(response.body).toEqual({ error: 'Invalid field' })
    })
  })

  describe('DELETE interceptor returning custom responses', async () => {
    const requestInterceptor: RequestInterceptor = {
      delete: ({ id }, actions) => {
        if (id === 'system-id') {
          return actions.response({ status: 403, body: { error: 'Cannot delete system item' } })
        }
        if (id === 'soft-deleted') {
          return actions.response({ status: 200, body: { message: 'Soft deleted' } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('DELETE returns 403 for system item', async () => {
      const response = await request(tembaServer).delete('/items/system-id')

      expect(response.statusCode).toEqual(403)
      expect(response.body).toEqual({ error: 'Cannot delete system item' })
    })

    test('DELETE returns custom 200 for soft delete', async () => {
      const response = await request(tembaServer).delete('/items/soft-deleted')

      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual({ message: 'Soft deleted' })
    })
  })

  describe('Response with default status', async () => {
    const requestInterceptor: RequestInterceptor = {
      post: ({ resource }, actions) => {
        if (resource === 'custom-body-only') {
          return actions.response({ body: { custom: true } })
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('actions.response defaults to status 200', async () => {
      const response = await request(tembaServer).post('/custom-body-only').send({ title: 'Test' })

      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual({ custom: true })
    })
  })
})
