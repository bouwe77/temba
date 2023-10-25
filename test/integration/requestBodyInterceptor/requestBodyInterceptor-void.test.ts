import request from 'supertest'
import { Config } from '../../../src/config'
import createServer from '../createServer'

//TODO add patch

describe('requestBodyInterceptors that return nothing (void) to indicate nothing should be done', () => {
  const requestBodyInterceptor = {
    post: ({ resource, body }) => {
      expect(['movies', 'pokemons']).toContain(resource)
      if (resource === 'movies') expect(body).toEqual({})
      if (resource === 'pokemons') expect(body).toEqual({ name: 'Pikachu' })
    },
    put: ({ resource, body }) => {
      expect(resource).toBe('pokemons')
      expect(body).toEqual({})
    },
  }

  const tembaServer = createServer({ requestBodyInterceptor } as unknown as Config)

  test('POST with a requestBodyInterceptor that returns void', async () => {
    const resourceUrl = '/movies'

    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post(resourceUrl)

    expect(response.statusCode).toEqual(201)
  })

  test('PUT with a requestBodyInterceptor that returns void', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer)
      .post(resourceUrl)
      .send({ name: 'Pikachu' })
      .set('Content-Type', 'application/json')
    expect(postResponse.statusCode).toEqual(201)
    const id = postResponse.header.location.split('/').pop()

    // Send a PUT request to the id.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).put(`${resourceUrl}/${id}`)

    expect(response.statusCode).toEqual(200)
  })
})
