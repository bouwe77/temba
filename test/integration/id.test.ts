import { test, expect } from 'vitest'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

// The id is either expected or not allowed in URLs.
// The id is never allowed in request bodies.

const tembaServer = createServer()
const resource = '/articles/'

test('When POSTing and PUTting with ID in request body, return bad request', async () => {
  // TODO De implementatie is een defalt JSON Schema die geen ID toestaat.
  // Indien er al een JSON Schema is geconfigureerd, dan ID erin mergen?

  // Initially, there are no items
  const getAllResponse = await sendRequest(tembaServer, 'get', resource)
  expect(getAllResponse.statusCode).toBe(200)
  expect(getAllResponse.body.length).toBe(0)

  // A POST with an ID in the request body is a bad request.
  const newItem = { id: 'some_id', name: 'newItem' }
  const createNewResponse = await sendRequest(tembaServer, 'post', resource, newItem)
  expect(createNewResponse.statusCode).toBe(400)
  expect(createNewResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // A PUT with an ID in the request body is a bad request.
  const replacedItem = { id: 'some_id', name: 'replacedItem' }
  const replaceResponse = await sendRequest(tembaServer, 'put', resource + '/some_id', replacedItem)
  expect(replaceResponse.statusCode).toBe(400)
  expect(replaceResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // A PATCH with an ID in the request body is a bad request.
  const updatedItem = { id: 'some_id', name: 'updatedItem' }
  const updateResponse = await sendRequest(tembaServer, 'patch', resource + '/some_id', updatedItem)
  expect(updateResponse.statusCode).toBe(400)
  expect(updateResponse.body).toEqual({ message: 'An id is not allowed in the request body' })

  // Because all requests failed, there are still no items.
  const getAllResponse2 = await sendRequest(tembaServer, 'get', resource)
  expect(getAllResponse2.statusCode).toBe(200)
  expect(getAllResponse2.body.length).toBe(0)
})

test('PUT without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await sendRequest(tembaServer, 'put', resource, { name: 'newItem' })
  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual({ message: 'An id is required in the URL' })
})

test('PATCH without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await sendRequest(tembaServer, 'patch', resource, { name: 'newItem' })
  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual({ message: 'An id is required in the URL' })
})

test('Supplying an id in the URL for POST is a bad request because a client can not determine the id', async () => {
  const response = await sendRequest(tembaServer, 'post', resource + 'id_does_not_exist', {
    name: 'newItem',
  })

  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual({ message: 'An id is not allowed in the URL' })
})
