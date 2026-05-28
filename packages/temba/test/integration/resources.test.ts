import request from 'supertest'
import { expect, test } from 'vitest'
import { createServer } from './createServer'

/*
  Tests configured resources.
*/

test('Only configured resources can be found, others return a 404', async () => {
  const tembaServer = await createServer({
    resources: [
      'movies',
      {
        resourcePath: 'people',
        singularName: 'person',
        pluralName: 'people',
      },
    ],
  })

  // The movies resource is configured, so it can be found.
  const moviesResponse = await request(tembaServer).get('/movies')
  expect(moviesResponse.statusCode).toEqual(200)

  // People are configured as an extended resource, so it can be found.
  const peopleResponse = await request(tembaServer).get('/people')
  expect(peopleResponse.statusCode).toEqual(200)

  // The actors resource is not configured, so it can not be found.
  const response = await request(tembaServer).get('/actors')
  expect(response.statusCode).toEqual(404)
})
