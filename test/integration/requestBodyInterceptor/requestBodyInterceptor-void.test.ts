import request from 'supertest'
import { create } from '../../../src/index'
import { Config } from '../../../src/config'

//TODO add patch

describe('requestBodyInterceptors that return nothing (void) to indicate nothing should be done', () => {
  const requestBodyInterceptor = {
    post: ({ resourceName, requestBody }) => {
      expect(['movies', 'pokemons']).toContain(resourceName)
      if (resourceName === 'movies') expect(requestBody).toEqual({})
      if (resourceName === 'pokemons') expect(requestBody).toEqual({ name: 'Pikachu' })
    },
    put: ({ resourceName, requestBody }) => {
      expect(resourceName).toBe('pokemons')
      expect(requestBody).toEqual({})
    },
  }

  const tembaServer = create({ requestBodyInterceptor } as unknown as Config)

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
