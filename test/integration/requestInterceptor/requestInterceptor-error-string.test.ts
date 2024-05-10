import { describe, test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'

describe('requestInterceptors that return a string to indicate a 400 Bad Request should be returned', () => {
  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }) => {
      if (resource === 'movies') return '400 Bad Request error from POST'
    },
    put: () => {
      return '400 Bad Request error from PUT'
    },
    patch: () => {
      return '400 Bad Request error from PATCH'
    },
  }

  const tembaServer = createServer({ requestInterceptor } satisfies UserConfig)

  test('POST with a requestInterceptor that returns an error string should result in 400 Bad Request', async () => {
    const expectedResource = 'movies'
    const resourceUrl = '/' + expectedResource

    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post(resourceUrl)

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from POST')
  })

  test('PUT with a requestInterceptor that returns an error string should result in 400 Bad Request', async () => {
    const expectedResource = 'pokemons'
    const resourceUrl = '/' + expectedResource

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer).post(resourceUrl).send({ name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    const id = postResponse.header.location?.split('/').pop()

    // Send a PUT request to the id.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).put(`${resourceUrl}/${id}`)

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from PUT')
  })

  test('PATCH with a requestInterceptor that returns an error string should result in 400 Bad Request', async () => {
    const expectedResource = 'pokemons'
    const resourceUrl = '/' + expectedResource

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer).post(resourceUrl).send({ name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    const id = postResponse.header.location?.split('/').pop()

    // Send a PATCH request to the id.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).patch(`${resourceUrl}/${id}`)

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from PATCH')
  })
})
