import { describe, test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'

describe('Breaking change: Plain object returns are now ignored', () => {
  describe('POST interceptor returning plain objects (legacy behavior)', async () => {
    const requestInterceptor: RequestInterceptor = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      post: ({ resource }, _actions): any => {
        if (resource === 'movies') {
          // This is the OLD way - returning a plain object
          // With the new API, this is IGNORED as part of the breaking change
          // The original request body will be used instead
          return { title: 'Modified Title' }
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('Plain object return is ignored, original body is used', async () => {
      const response = await request(tembaServer)
        .post('/movies')
        .send({ title: 'Original Title' })

      expect(response.statusCode).toEqual(201)
      // The title should be the original one, NOT the modified one
      expect(response.body.title).toEqual('Original Title')

      // Verify it was saved with the original title
      const id = response.header.location?.split('/').pop()
      const getResponse = await request(tembaServer).get(`/movies/${id}`)
      expect(getResponse.body.title).toEqual('Original Title')
    })
  })

  describe('PUT interceptor returning plain objects (legacy behavior)', async () => {
    const requestInterceptor: RequestInterceptor = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      put: ({ body }, _actions): any => {
        // This is the OLD way - returning a plain object
        // With the new API, this is IGNORED as part of the breaking change
        // The original request body will be used instead
        return { ...(body as object), modified: true }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('Plain object return is ignored, original body is used', async () => {
      // First create an item
      const createResponse = await request(tembaServer).post('/items').send({ name: 'Item' })
      const id = createResponse.body.id

      // Try to update with interceptor that returns plain object
      const response = await request(tembaServer).put(`/items/${id}`).send({ name: 'Updated' })

      expect(response.statusCode).toEqual(200)
      expect(response.body.name).toEqual('Updated')
      // The 'modified' field should NOT be present
      expect(response.body.modified).toBeUndefined()
    })
  })

  describe('PATCH interceptor returning plain objects (legacy behavior)', async () => {
    const requestInterceptor: RequestInterceptor = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      patch: ({ body }, _actions): any => {
        // This is the OLD way - returning a plain object
        // With the new API, this is IGNORED as part of the breaking change
        // The original request body will be used instead
        return { ...(body as object), patched: true }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('Plain object return is ignored, original body is used', async () => {
      // First create an item
      const createResponse = await request(tembaServer).post('/items').send({ name: 'Item' })
      const id = createResponse.body.id

      // Try to patch with interceptor that returns plain object
      const response = await request(tembaServer).patch(`/items/${id}`).send({ name: 'Patched' })

      expect(response.statusCode).toEqual(200)
      expect(response.body.name).toEqual('Patched')
      // The 'patched' field should NOT be present
      expect(response.body.patched).toBeUndefined()
    })
  })

  describe('Correct usage with actions.setRequestBody', async () => {
    const requestInterceptor: RequestInterceptor = {
      post: ({ body }, actions) => {
        // This is the NEW correct way
        return actions.setRequestBody({ ...(body as object), added: true })
      },
      put: ({ body }, actions) => {
        // This is the NEW correct way
        return actions.setRequestBody({ ...(body as object), replaced: true })
      },
      patch: ({ body }, actions) => {
        // This is the NEW correct way
        return actions.setRequestBody({ ...(body as object), updated: true })
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('Using actions.setRequestBody correctly modifies the body for POST', async () => {
      const response = await request(tembaServer).post('/items').send({ name: 'Item' })

      expect(response.statusCode).toEqual(201)
      expect(response.body.name).toEqual('Item')
      expect(response.body.added).toEqual(true)
    })

    test('Using actions.setRequestBody correctly modifies the body for PUT', async () => {
      // First create an item
      const createResponse = await request(tembaServer).post('/items').send({ name: 'Item' })
      const id = createResponse.body.id

      // Update with correct usage
      const response = await request(tembaServer).put(`/items/${id}`).send({ name: 'Updated' })

      expect(response.statusCode).toEqual(200)
      expect(response.body.name).toEqual('Updated')
      expect(response.body.replaced).toEqual(true)
    })

    test('Using actions.setRequestBody correctly modifies the body for PATCH', async () => {
      // First create an item
      const createResponse = await request(tembaServer).post('/items').send({ name: 'Item' })
      const id = createResponse.body.id

      // Patch with correct usage
      const response = await request(tembaServer).patch(`/items/${id}`).send({ name: 'Patched' })

      expect(response.statusCode).toEqual(200)
      expect(response.body.name).toEqual('Patched')
      expect(response.body.updated).toEqual(true)
    })
  })
})
