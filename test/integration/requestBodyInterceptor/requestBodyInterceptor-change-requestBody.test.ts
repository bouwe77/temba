import request from 'supertest'
import { create } from '../../../src/index'
import { Config } from '../../../src/config'

//TODO add patch

describe('requestBodyInterceptors that return a (new or changed) requestBody', () => {
  const requestBodyInterceptor = {
    post: (resourceName) => {
      expect(['movies', 'pokemons']).toContain(resourceName)
      if (resourceName === 'movies') return { title: 'The Matrix' }
    },
    put: (resourceName, requestBody) => {
      expect(resourceName).toBe('pokemons')
      return { ...requestBody, replaced: true }
    },
  }

  const tembaServer = create({ requestBodyInterceptor } as unknown as Config)

  test('POST with a requestBodyInterceptor that returns a requestBody', async () => {
    const resourceUrl = '/movies'

    // Send a POST request.
    const response = await request(tembaServer)
      .post(resourceUrl)
      .send({ title: 'Star Wars' })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).toEqual(201)

    const id = response.header.location.split('/').pop()

    const getResponse = await request(tembaServer).get(`${resourceUrl}/${id}`)
    expect(getResponse.statusCode).toEqual(200)
    expect(getResponse.body.id).toEqual(id)
    expect(getResponse.body.title).toEqual('The Matrix')
  })

  test('PUT with a requestBodyInterceptor that returns a requestBody', async () => {
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
    const response = await request(tembaServer)
      .put(`${resourceUrl}/${id}`)
      .send({ name: 'Mew' })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).toEqual(200)
    expect(response.body.id).toEqual(id)
    expect(response.body.name).toEqual('Mew')
    expect(response.body.replaced).toEqual(true)
  })
})
