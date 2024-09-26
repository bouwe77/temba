import { describe, test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import { createHttpServer } from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'

describe('requestInterceptors does not return an object', () => {
  const getResponse = (resource: string | null) => {
    if (resource === 'return-number') return 1
    if (resource === 'return-array') return [1, 2, 3]
    if (resource === 'return-boolean') return true
    return {}
  }

  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }) => {
      return getResponse(resource)
    },
    put: ({ resource }) => {
      return getResponse(resource)
    },
    patch: ({ resource }) => {
      return getResponse(resource)
    },
  }

  const tembaServer = createHttpServer({ requestInterceptor } satisfies UserConfig)

  test.skip('requestInterceptor returns the original request body when something else than an object or string is returned', async () => {
    // Send POST requests.
    let response = await request(tembaServer).post('/return-number').send({ name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const numberId = response.header.location?.split('/').pop()

    response = await request(tembaServer).post('/return-array').send({ name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const arrayId = response.header.location?.split('/').pop()

    response = await request(tembaServer).post('/return-boolean').send({ name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const booleanId = response.header.location?.split('/').pop()

    // Send PUT requests.
    response = await request(tembaServer)
      .put('/return-number/' + numberId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await request(tembaServer)
      .put('/return-array/' + arrayId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await request(tembaServer)
      .put('/return-boolean/' + booleanId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    // Send PATCH requests.
    response = await request(tembaServer)
      .patch('/return-number/' + numberId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await request(tembaServer)
      .patch('/return-array/' + arrayId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await request(tembaServer)
      .patch('/return-boolean/' + booleanId)
      .send({ name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')
  })
})
