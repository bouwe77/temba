import { describe, test, expect } from 'vitest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'
import { sendRequest } from '../../sendRequest'

describe('requestInterceptors that return nothing (void) to indicate nothing should be done', () => {
  const requestInterceptor = {
    post: () => {},
    put: () => {},
    patch: () => {},
  }

  const tembaServer = createServer({ requestInterceptor } satisfies UserConfig)

  test('POST with a requestInterceptor that returns void', async () => {
    const resourceUrl = '/movies'

    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await sendRequest(tembaServer, 'post', resourceUrl)

    expect(response.statusCode).toEqual(201)
  })

  test('PUT with a requestInterceptor that returns void', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await sendRequest(tembaServer, 'post', resourceUrl, { name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    const id = postResponse.headers['location']?.split('/').pop()

    // Send a PUT request to the id.
    // The request body is empty because that's not important for this test.
    const response = await sendRequest(tembaServer, 'put', `${resourceUrl}/${id}`)

    expect(response.statusCode).toEqual(200)
  })

  test('PATCH with a requestInterceptor that returns void', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await sendRequest(tembaServer, 'post', resourceUrl, { name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    const id = postResponse.headers['location']?.split('/').pop()

    // Send a PATCH request to the id.
    // The request body is empty because that's not important for this test.
    const response = await sendRequest(tembaServer, 'patch', `${resourceUrl}/${id}`)

    expect(response.statusCode).toEqual(200)
  })
})
