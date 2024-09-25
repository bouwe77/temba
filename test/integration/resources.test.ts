import { test, expect } from 'vitest'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests configured resources.
*/

test('Only configured resources can be found, others return a 404', async () => {
  const tembaServer = createServer({
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
  const moviesResponse = await sendRequest(tembaServer, 'get', '/movies')
  expect(moviesResponse.statusCode).toEqual(200)

  // People are configured as an extended resource, so it can be found.
  const peopleResponse = await sendRequest(tembaServer, 'get', '/people')
  expect(peopleResponse.statusCode).toEqual(200)

  // The actors resource is not configured, so it can not be found.
  const response = await sendRequest(tembaServer, 'get', '/actors')
  expect(response.statusCode).toEqual(404)
})
