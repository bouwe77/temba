import { describe, test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import { createHttpServer } from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { TembaError } from '../../../src/requestInterceptor/TembaError'

describe('requestInterceptors that throw a TembaError should return the message and status code', () => {
  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }) => {
      if (resource === 'movies') throw new TembaError('400 Bad Request error from POST', 400)
    },
    put: () => {
      throw new TembaError('500 Internal Server Error from PUT', 500)
    },
    patch: () => {
      throw new TembaError('200 OK from PATCH', 200)
    },
  }

  const tembaServer = createHttpServer({ requestInterceptor } satisfies UserConfig)

  test.skip('POST with a requestInterceptor that returns an error should result in 400 Bad Request', async () => {
    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post('/movies')

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from POST')
  })

  test.skip('PUT with a requestInterceptor that returns an error should result in 500 Internal Server Error', async () => {
    // Send a PUT request to the id.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).put('/pokemons/pikachu')

    expect(response.statusCode).toEqual(500)
    expect(response.body.message).toEqual('500 Internal Server Error from PUT')
  })

  test.skip('PATCH with a requestInterceptor that returns an error should result in 200 OK', async () => {
    // Send a PATCH request to the id.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).patch('/pokemons/pikachu')

    expect(response.statusCode).toEqual(200)
    expect(response.body.message).toEqual('200 OK from PATCH')
  })
})

describe('requestInterceptors that throw a regular Error should return a 500 Internal Server Error', () => {
  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }) => {
      if (resource === 'movies') throw new Error('Something is wrong')
    },
    put: ({ resource }) => {
      if (resource === 'movies') throw new Error('Something is wrong here as well')
    },
  }

  const tembaServer = createHttpServer({ requestInterceptor } satisfies UserConfig)

  test.skip('POST and PUT return 500 status code', async () => {
    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post('/movies')

    expect(response.statusCode).toEqual(500)
    expect(response.body.message).toEqual('Something is wrong')

    // Send a PUT request.
    // The request body is empty because that's not important for this test.
    const response2 = await request(tembaServer).put('/movies/et')
    expect(response2.statusCode).toEqual(500)
    expect(response2.body.message).toEqual('Something is wrong here as well')
  })
})
