import request from 'supertest'
import { beforeAll, describe, expect, test } from 'vitest'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { createServer } from '../createServer'

type ServerInstance = Awaited<ReturnType<typeof createServer>>
type RequestFactory = Record<string, (url: string) => request.Test>
const createRequest = (server: ServerInstance) => request(server) as unknown as RequestFactory

describe('requestInterceptor error handling', () => {
  const throwingInterceptor: RequestInterceptor = {
    get: () => {
      throw new Error('GET error')
    },
    post: () => {
      throw new Error('POST error')
    },
    put: () => {
      throw new Error('PUT error')
    },
    patch: () => {
      throw new Error('PATCH error')
    },
    delete: () => {
      throw new Error('DELETE error')
    },
  }

  let tembaServer: ServerInstance

  beforeAll(async () => {
    tembaServer = await createServer({ requestInterceptor: throwingInterceptor })
  })

  test.each([
    { method: 'get', path: '/movies', body: undefined, expectedError: 'GET error' },
    { method: 'post', path: '/movies', body: { title: 'Test' }, expectedError: 'POST error' },
    { method: 'put', path: '/movies/test-id', body: { title: 'Test' }, expectedError: 'PUT error' },
    {
      method: 'patch',
      path: '/movies/test-id',
      body: { title: 'Test' },
      expectedError: 'PATCH error',
    },
    { method: 'delete', path: '/movies/test-id', body: undefined, expectedError: 'DELETE error' },
  ])('$method interceptor exception returns 500', async ({ method, path, body, expectedError }) => {
    let req = createRequest(tembaServer)[method](path)

    if (body) req = req.send(body)

    const response = await req

    expect(response.statusCode).toEqual(500)
    expect(response.body).toEqual({ message: expectedError })
  })

  test('Async interceptor exception returns 500', async () => {
    const asyncInterceptor: RequestInterceptor = {
      post: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Async operation failed')
      },
    }
    const server = await createServer({ requestInterceptor: asyncInterceptor })

    const response = await request(server).post('/movies').send({ title: 'Test' })

    expect(response.statusCode).toEqual(500)
    expect(response.body).toEqual({ message: 'Async operation failed' })
  })

  test('TypeError in interceptor returns 500', async () => {
    const typeErrorInterceptor: RequestInterceptor = {
      // @ts-expect-error -- we want to test a runtime TypeError ---
      get: () => {
        const obj: { prop?: string } = {}
        // @ts-expect-error -- we want to test a runtime TypeError ---
        return obj.prop.length
      },
    }
    const server = await createServer({ requestInterceptor: typeErrorInterceptor })

    const response = await request(server).get('/movies')

    expect(response.statusCode).toEqual(500)
    expect(response.body.message).toContain('Cannot read')
  })
})
