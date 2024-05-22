import { test, expect } from 'vitest'
import request from 'supertest'
import createServer from './createServer'

// The id is either expected or not allowed in URLs.
// The id is never allowed in request bodies.

const tembaServer = createServer()
const resource = '/articles/'

test('When POSTing and PUTting with ID in request body, return bad request', async () => {
  // TODO De implementatie is een defalt JSON Schema die geen ID toestaat.
  // Indien er al een JSON Schema is geconfigureerd, dan ID erin mergen?

  // Initially, there are no items
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.status).toBe(200)
  expect(getAllResponse.body.length).toBe(0)

  // A POST with an ID in the request body is a bad request.
  const newItem = { id: 'some_id', name: 'newItem' }
  const createNewResponse = await request(tembaServer).post(resource).send(newItem)
  expect(createNewResponse.status).toBe(400)

  // A PUT with an ID in the request body is a bad request.
  const replacedItem = { id: 'some_id', name: 'replacedItem' }
  const replaceResponse = await request(tembaServer)
    .put(resource + '/some_id')
    .send(replacedItem)
  expect(replaceResponse.status).toBe(400)

  // A PATCH with an ID in the request body is a bad request.
  const updatedItem = { id: 'some_id', name: 'updatedItem' }
  const updateResponse = await request(tembaServer)
    .patch(resource + '/some_id')
    .send(updatedItem)
  expect(updateResponse.status).toBe(400)

  // Because all requests failed, there are still no items.
  const getAllResponse2 = await request(tembaServer).get(resource)
  expect(getAllResponse2.status).toBe(200)
  expect(getAllResponse2.body.length).toBe(0)
})

//TODO Imlementatie is dat in de URL er gewoon niks achter de resource mag staan...
// Volgens mij kan dit ongeacht de method

test('PUT without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await request(tembaServer).put(resource).send({ name: 'newItem' })
  expect(response.status).toBe(400)
})

test('PATCH without ID in URL returns 400 Bad Request because not enough info is provided', async () => {
  const response = await request(tembaServer).patch(resource).send({ name: 'newItem' })
  expect(response.status).toBe(400)
})

test('Supplying an id in the URL for POST is a bad request because a client can not determine the id', async () => {
  const response = await request(tembaServer)
    .post(resource + 'id_does_not_exist')
    .send({ name: 'newItem' })

  expect(response.status).toBe(400)
})
