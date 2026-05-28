import request from 'supertest'
import { describe, expect, test } from 'vitest'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { createServer } from '../createServer'

describe('requestInterceptor with actions.setRequestBody() for overriding request bodies', async () => {
  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }, actions) => {
      if (resource === 'movies') return actions.setRequestBody({ title: 'The Matrix' })
    },
    put: ({ body }, actions) => {
      return actions.setRequestBody({ ...(body as object), replaced: true })
    },
    patch: ({ body }, actions) => {
      return actions.setRequestBody({ ...(body as object), updated: true })
    },
  }

  const tembaServer = await createServer({ requestInterceptor })

  test('POST with a requestInterceptor that returns a request body', async () => {
    const resourceUrl = '/movies'

    // Send a POST request.
    const response = await request(tembaServer).post(resourceUrl).send({ title: 'Star Wars' })

    expect(response.statusCode).toEqual(201)
    expect(response.body.title).toEqual('The Matrix')

    const id = response.header.location?.split('/').pop()

    const getResponse = await request(tembaServer).get(`${resourceUrl}/${id}`)
    expect(getResponse.statusCode).toEqual(200)
    expect(getResponse.body.id).toEqual(id)
    expect(getResponse.body.title).toEqual('The Matrix')
  })

  test('PUT with a requestInterceptor that returns a request body', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer).post(resourceUrl).send({ name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    expect(postResponse.body.name).toEqual('Pikachu')
    expect(postResponse.body.replaced).toBeUndefined()

    const id = postResponse.header.location?.split('/').pop()

    // Send a PUT request to the id.
    const response = await request(tembaServer).put(`${resourceUrl}/${id}`).send({ name: 'Mew' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.id).toEqual(id)
    expect(response.body.name).toEqual('Mew')
    expect(response.body.replaced).toEqual(true)
  })

  test('PATCH with a requestInterceptor that returns a request body', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer).post(resourceUrl).send({ name: 'Pikachu' })
    expect(postResponse.statusCode).toEqual(201)
    expect(postResponse.body.name).toEqual('Pikachu')
    expect(postResponse.body.updated).toBeUndefined()

    const id = postResponse.header.location?.split('/').pop()

    // Send a PATCH request to the id.
    const response = await request(tembaServer).patch(`${resourceUrl}/${id}`).send({ name: 'Mew' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.id).toEqual(id)
    expect(response.body.name).toEqual('Mew')
    expect(response.body.updated).toEqual(true)
  })
})
