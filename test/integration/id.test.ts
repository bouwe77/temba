import { test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

// The id is either expected or not allowed in URLs.
// The id is never allowed in request bodies.

const tembaServer = createServer()
const resource = '/articles/'

test('When POSTing and PUTting with ID in request body, return bad request', async () => {
  // Initially, there are no items
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.status).toBe(200)
  expect(getAllResponse.body.length).toBe(0)

  // A POST with an ID in the request body is a bad request.
  const newItem = { id: 'some_id', name: 'newItem' }
  const createNewResponse = await request(tembaServer).post(resource).send(newItem)
  expect(createNewResponse.status).toBe(400)
  expect(createNewResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // A PUT with an ID in the request body is a bad request.
  const replacedItem = { id: 'some_id', name: 'replacedItem' }
  const replaceResponse = await request(tembaServer)
    .put(resource + '/some_id')
    .send(replacedItem)
  expect(replaceResponse.status).toBe(400)
  expect(replaceResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // A PATCH with an ID in the request body is a bad request.
  const updatedItem = { id: 'some_id', name: 'updatedItem' }
  const updateResponse = await request(tembaServer)
    .patch(resource + '/some_id')
    .send(updatedItem)
  expect(updateResponse.status).toBe(400)
  expect(updateResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // Because all requests failed, there are still no items.
  const getAllResponse2 = await request(tembaServer).get(resource)
  expect(getAllResponse2.status).toBe(200)
  expect(getAllResponse2.body.length).toBe(0)
})

test('PUT without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await request(tembaServer).put(resource).send({ name: 'newItem' })
  expect(response.status).toBe(400)
  expect(response.body).toEqual({ message: 'An id is required in the URL' })
})

test('PATCH without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await request(tembaServer).patch(resource).send({ name: 'newItem' })
  expect(response.status).toBe(400)
  expect(response.body).toEqual({ message: 'An id is required in the URL' })
})
