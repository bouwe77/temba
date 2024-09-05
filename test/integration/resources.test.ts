import { test, expect } from 'vitest'
import request from 'supertest'
import createServer from './createServer'

/*
  Tests configured resources.
*/

test('Only configured resources can be found, others return a 404', async () => {
  const tembaServer = createServer({
    resources: ['movies'],
  })

  // The movies resource is configured, so it can be found.
  const successResponse = await request(tembaServer).get('/movies')
  expect(successResponse.statusCode).toEqual(200)

  // The actors resource is not configured, so it can not be found.
  const response = await request(tembaServer).get('/actors')
  expect(response.statusCode).toEqual(404)
})
