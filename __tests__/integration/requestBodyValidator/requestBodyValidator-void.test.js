import request from 'supertest'
import { create } from '../../../dist/server.js'

// The possible values for the requestBodyValidator object:
// - undefined, null, or an empty object
// - An object with a post or put field, or both, which contain a function

// Return types of a requestBodyValidator function:
// 1) void: Everything is fine and/or nothing to validate
// 2) string: A 400 Bad Request Error message
// 3) Anything else: A mutated requestBody

// LET OP Je kunt nu volgens mij een lege request body meegeven, en Temba vindt dat prima.
// Eigenlijk is dat ook wel prima, want als je dat niet wilt dan maak je gewoon een
// requestBodyValidator die dat afvangt.

describe('requestBodyValidators that return nothing (void) to indicate nothing should be done', () => {
  const requestBodyValidator = {
    post: (resourceName, requestBody) => {
      expect(['movies', 'pokemons']).toContain(resourceName)
      if (resourceName === 'movies') expect(requestBody).toEqual({})
      if (resourceName === 'pokemons')
        expect(requestBody).toEqual({ name: 'Pikachu' })
    },
    put: (resourceName, requestBody) => {
      expect(resourceName).toBe('pokemons')
      expect(requestBody).toEqual({})
    },
  }

  const tembaServer = create({ requestBodyValidator })

  test('POST with a requestBodyValidator that returns void', async () => {
    const resourceUrl = '/movies'

    // Send a POST request.
    // The request body is empty because that's not important for this test.
    const response = await request(tembaServer).post(resourceUrl)

    expect(response.statusCode).toEqual(201)
  })

  test('PUT with a requestBodyValidator that returns void', async () => {
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
