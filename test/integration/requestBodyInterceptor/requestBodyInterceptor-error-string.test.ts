import request from 'supertest'
import { create } from '../../../src/index'
import { Config } from '../../../src/config'

//TODO add patch

describe('requestBodyInterceptors that return a string to indicate a 400 Bad Request should be returned', () => {
  const requestBodyInterceptor = {
    post: ({ resourceName, requestBody }) => {
      expect(['movies', 'pokemons']).toContain(resourceName)
      if (resourceName === 'movies') expect(requestBody).toEqual({})
      if (resourceName === 'pokemons') expect(requestBody).toEqual({ name: 'Pikachu' })
      if (resourceName === 'movies') return '400 Bad Request error from POST'
    },
    put: ({ resourceName, requestBody }) => {
      expect(resourceName).toBe('pokemons')
      expect(requestBody).toEqual({})
      return '400 Bad Request error from PUT'
    },
  }

  const tembaServer = create({ requestBodyInterceptor } as unknown as Config)

  test('POST with a requestBodyInterceptor that returns an error string should result in 400 Bad Request', async () => {
    const expectedResourceName = 'movies'
    const resourceUrl = '/' + expectedResourceName

    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post(resourceUrl)

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from POST')
  })

  test('PUT with a requestBodyInterceptor that returns an error string should result in 400 Bad Request', async () => {
    const expectedResourceName = 'pokemons'
    const resourceUrl = '/' + expectedResourceName

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

    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual('400 Bad Request error from PUT')
  })
})
