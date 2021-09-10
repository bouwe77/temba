import fetch from 'node-fetch'

import { hostname } from '../_config'
const resource = '/movies/'

beforeEach(async () => {
  // Delete all items.
  const deleteAllResponse = await fetch(hostname + resource, {
    method: 'DELETE',
  })
  expect(deleteAllResponse.status).toBe(204)
})

test('Create, update and delete an item', async () => {
  // Initially, there are no items so a get all returns an empty array.
  const getAllResponse = await fetch(hostname + resource)
  expect(getAllResponse.status).toBe(200)
  const jsonNoItems = await getAllResponse.json()
  expect(jsonNoItems.length).toBe(0)

  // Initially, there are no items so a getting an id returns a 404.
  const getOneResponse = await fetch(hostname + resource + 'id_does_not_exist')
  expect(getOneResponse.status).toBe(404)

  // Initially, there are no items so a updating an id returns a 404.
  const nonExistingItem = { id: 'id_does_not_exist', name: 'this should fail' }
  const updateNonExistingResponse = await fetch(
    hostname + resource + '/id_does_not_exist',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nonExistingItem),
    },
  )
  expect(updateNonExistingResponse.status).toBe(404)

  // Initially, there are no items, but deleting an id always returns a 204 anyway.
  const deleteNonExistingResponse = await fetch(
    hostname + resource + '/id_does_not_exist',
    {
      method: 'DELETE',
    },
  )
  expect(deleteNonExistingResponse.status).toBe(204)

  // Check again there are still no items.
  const getAllResponse2 = await fetch(hostname + resource)
  expect(getAllResponse2.status).toBe(200)
  const jsonNoItems2 = await getAllResponse2.json()
  expect(jsonNoItems2.length).toBe(0)

  // Create a new item.
  const newItem = { name: 'newItem' }
  const createNewResponse = await fetch(hostname + resource, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newItem),
  })
  expect(createNewResponse.status).toBe(201)
  const jsonCreatedItem = await createNewResponse.json()
  expect(jsonCreatedItem.name).toBe('newItem')
  expect(createNewResponse.headers.get('Location')).toEndWith(
    resource + jsonCreatedItem.id,
  )

  // Now there is one item. Get all items.
  const getAllOneItemResponse = await fetch(hostname + resource)
  expect(getAllOneItemResponse.status).toBe(200)
  const jsonOneItem = await getAllOneItemResponse.json()
  expect(jsonOneItem.length).toBe(1)
  expect(jsonOneItem[0].name).toBe('newItem')
  expect(jsonOneItem[0].id).toBe(jsonCreatedItem.id)

  // Get one item by ID.
  const getJustOneItemResponse = await fetch(
    hostname + resource + jsonCreatedItem.id,
  )
  expect(getJustOneItemResponse.status).toBe(200)
  const jsonJustOneItem = await getJustOneItemResponse.json()
  expect(jsonJustOneItem.name).toBe('newItem')
  expect(jsonJustOneItem.id).toBe(jsonCreatedItem.id)

  // Update one item by ID.
  const updatedItem = { id: jsonCreatedItem.id, name: 'updatedItem' }
  const updateResponse = await fetch(hostname + resource + jsonCreatedItem.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  })
  expect(updateResponse.status).toBe(200)
  const jsonUpdatedItem = await updateResponse.json()
  expect(jsonUpdatedItem.name).toBe('updatedItem')
  expect(jsonUpdatedItem.id).toEqual(jsonCreatedItem.id)

  // Delete one item by ID.
  const deleteResponse = await fetch(hostname + resource + jsonCreatedItem.id, {
    method: 'DELETE',
  })
  expect(deleteResponse.status).toBe(204)

  // Check there are no items anymore.
  const getAllResponse3 = await fetch(hostname + resource)
  expect(getAllResponse3.status).toBe(200)
  const jsonNoItems3 = await getAllResponse3.json()
  expect(jsonNoItems3.length).toBe(0)
})

test('When POSTing and PUTting with ID in request body, ignore ID in body', async () => {
  const hardCodedIdToIgnore = 'myID'

  // Initially, there are no items so a get all returns an empty array.
  const getAllResponse = await fetch(hostname + resource)
  expect(getAllResponse.status).toBe(200)
  const jsonNoItems = await getAllResponse.json()
  expect(jsonNoItems.length).toBe(0)

  // Create a new item, but ignore the ID in the request body.
  const newItem = { id: hardCodedIdToIgnore, name: 'newItem' }
  const createNewResponse = await fetch(hostname + resource, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newItem),
  })
  expect(createNewResponse.status).toBe(201)
  const jsonCreatedItem = await createNewResponse.json()
  expect(jsonCreatedItem.name).toBe('newItem')
  expect(jsonCreatedItem.id.length).toBeGreaterThan(0)
  expect(jsonCreatedItem.id).not.toEqual(hardCodedIdToIgnore)

  // Update one item by ID in the URI and ignore the ID in the request body.
  const updatedItem = { id: hardCodedIdToIgnore, name: 'updatedItem' }
  const updateResponse = await fetch(hostname + resource + jsonCreatedItem.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  })
  expect(updateResponse.status).toBe(200)
  const jsonUpdatedItem = await updateResponse.json()
  expect(jsonUpdatedItem.name).toBe('updatedItem')
  expect(jsonUpdatedItem.id).toEqual(jsonCreatedItem.id)

  // Now there is one item. Get all items.
  const getAllOneItemResponse = await fetch(hostname + resource)
  expect(getAllOneItemResponse.status).toBe(200)
  const jsonOneItem = await getAllOneItemResponse.json()
  expect(jsonOneItem.length).toBe(1)
  expect(jsonOneItem[0].name).toBe('updatedItem')
  expect(jsonOneItem[0].id).toBe(jsonCreatedItem.id)
})
