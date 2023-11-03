import request from 'supertest'
import createServer from './createServer'

/*
  Tests for OPTIONS requests
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

const resource = '/cars/'

test('OPTIONS', async () => {
  const optionsResponse = await request(tembaServer).options(resource)
  expect(optionsResponse.status).toBe(204)
})
