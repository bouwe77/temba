import request from 'supertest'
import { create } from '../../src/server'

/*
  Tests when configuring the apiPrefix.
*/

// This Temba server is created with an apiPrefix configured
const apiPrefix = 'api'
const tembaServer = create({ apiPrefix })

test('GET on root URL returns 404 Not Found error', async () => {
  const response = await request(tembaServer).get('/')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual('Not Found')
})

test('GET on apiPrefix URL returns welcome text', async () => {
  const response = await request(tembaServer).get('/' + apiPrefix)

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('It works! ツ')
})

test('GET on resource URL without apiPrefix returns 404 Not Found error', async () => {
  const response = await request(tembaServer).get('/movies')

  expect(response.statusCode).toEqual(404)
  expect(response.body.message).toEqual('Not Found')
})

test('GET on apiPrefix and resource URL returns empty array', async () => {
  const response = await request(tembaServer).get('/' + apiPrefix + '/movies')

  expect(response.statusCode).toEqual(200)
  expect(response.text).toEqual('[]')
})
