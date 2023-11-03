import request from 'supertest'
import { Config } from '../../../src/config'
import createServer from '../createServer'

describe('requestBodyInterceptors that return a (new or changed) request body', () => {
  const requestBodyInterceptor = {
    post: ({ resource }) => {
      if (resource === 'movies') return { title: 'The Matrix' }
    },
    put: ({ body }) => {
      return { ...body, replaced: true }
    },
    patch: ({ body }) => {
      return { ...body, updated: true }
    },
  }

  const tembaServer = createServer({ requestBodyInterceptor } as unknown as Config)

  test('POST with a requestBodyInterceptor that returns a request body', async () => {
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

  test('PUT with a requestBodyInterceptor that returns a request body', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer)
      .post(resourceUrl)
      .send({ name: 'Pikachu' })
      .set('Content-Type', 'application/json')
    expect(postResponse.statusCode).toEqual(201)
    expect(postResponse.body.name).toEqual('Pikachu')
    expect(postResponse.body.replaced).toBeUndefined()

    const id = postResponse.header.location.split('/').pop()

    // Send a PUT request to the id.
    const response = await request(tembaServer)
      .put(`${resourceUrl}/${id}`)
      .send({ name: 'Mew' })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).toEqual(200)
    expect(response.body.id).toEqual(id)
    expect(response.body.name).toEqual('Mew')
    expect(response.body.replaced).toEqual(true)
  })

  test('PATCH with a requestBodyInterceptor that returns a request body', async () => {
    const resourceUrl = '/pokemons'

    // First create a resource, so we have an id to PUT to.
    const postResponse = await request(tembaServer)
      .post(resourceUrl)
      .send({ name: 'Pikachu' })
      .set('Content-Type', 'application/json')
    expect(postResponse.statusCode).toEqual(201)
    expect(postResponse.body.name).toEqual('Pikachu')
    expect(postResponse.body.updated).toBeUndefined()

    const id = postResponse.header.location.split('/').pop()

    // Send a PUT request to the id.
    const response = await request(tembaServer)
      .patch(`${resourceUrl}/${id}`)
      .send({ name: 'Mew' })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).toEqual(200)
    expect(response.body.id).toEqual(id)
    expect(response.body.name).toEqual('Mew')
    expect(response.body.updated).toEqual(true)
  })
})
