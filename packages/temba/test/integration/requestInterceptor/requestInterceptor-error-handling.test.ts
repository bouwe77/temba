import { describe, test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'

describe('requestInterceptor error handling', () => {
  describe('Runtime exceptions in GET interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: () => {
        throw new Error('Something went wrong in GET')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('GET interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).get('/movies')

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Something went wrong in GET' })
    })
  })

  describe('Runtime exceptions in POST interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      post: () => {
        throw new Error('Something went wrong in POST')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('POST interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).post('/movies').send({ title: 'Test' })

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Something went wrong in POST' })
    })
  })

  describe('Runtime exceptions in PUT interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      put: () => {
        throw new Error('Something went wrong in PUT')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('PUT interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).put('/movies/test-id').send({ title: 'Test' })

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Something went wrong in PUT' })
    })
  })

  describe('Runtime exceptions in PATCH interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      patch: () => {
        throw new Error('Something went wrong in PATCH')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('PATCH interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).patch('/movies/test-id').send({ title: 'Test' })

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Something went wrong in PATCH' })
    })
  })

  describe('Runtime exceptions in DELETE interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      delete: () => {
        throw new Error('Something went wrong in DELETE')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('DELETE interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).delete('/movies/test-id')

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Something went wrong in DELETE' })
    })
  })

  describe('Async runtime exceptions in interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      post: async () => {
        // Simulate an async operation that throws
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Async operation failed')
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('Async POST interceptor exception returns 500 with error message', async () => {
      const response = await request(tembaServer).post('/movies').send({ title: 'Test' })

      expect(response.statusCode).toEqual(500)
      expect(response.body).toEqual({ message: 'Async operation failed' })
    })
  })

  describe('TypeError in interceptor', async () => {
    const requestInterceptor: RequestInterceptor = {
      get: () => {
        // Intentionally cause a TypeError by accessing property on undefined
        const obj: { prop?: string } = {}
        // @ts-expect-error - intentionally causing TypeError for testing
        return obj.prop.length
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    test('TypeError in interceptor returns 500 with error message', async () => {
      const response = await request(tembaServer).get('/movies')

      expect(response.statusCode).toEqual(500)
      expect(response.body.message).toContain('Cannot read')
    })
  })
})
