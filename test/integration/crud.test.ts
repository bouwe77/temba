import request from 'supertest'
import createServer from './createServer'
import { describe, beforeEach, test, expect } from 'vitest'

/*
  Tests for a CRUD roundtrip along all supported HTTP methods.
*/

describe('CRUD', () => {
  // This Temba server is created with the default configuration, i.e. no config object is supplied.
  const tembaServer = createServer()

  const resource = '/articles/'

  beforeEach(async () => {
    // Delete all items.
    await request(tembaServer).delete(resource)
  })

  test('Read, create, replace, update and delete resources', async () => {
    // Initially, there are no items so a get all returns an empty array.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.status).toBe(200)
    expect(getAllResponse.body.length).toBe(0)

    // Initially, there are no items so a getting an id returns a 404.
    const getOneResponse = await request(tembaServer).get(resource + 'id_does_not_exist')
    expect(getOneResponse.status).toBe(404)

    // Initially, there are no items so a replacing something by id returns a 404.
    const nonExistingItem = {
      id: 'id_does_not_exist',
      name: 'this should fail',
    }
    const replaceNonExistingResponse = await request(tembaServer)
      .put(resource + 'id_does_not_exist')
      .send(nonExistingItem)
    expect(replaceNonExistingResponse.status).toBe(404)

    // Initially, there are no items so a updating something by id returns a 404.
    const updateNonExistingResponse = await request(tembaServer)
      .patch(resource + 'id_does_not_exist')
      .send(nonExistingItem)
    expect(updateNonExistingResponse.status).toBe(404)

    // Initially, there are no items, but deleting an id always returns a 204 anyway.
    const deleteNonExistingResponse = await request(tembaServer).delete(
      resource + 'id_does_not_exist',
    )
    expect(deleteNonExistingResponse.status).toBe(204)

    // Check again there are still no items.
    const getAllResponse2 = await request(tembaServer).get(resource)
    expect(getAllResponse2.status).toBe(200)
    expect(getAllResponse2.body.length).toBe(0)

    // Create a new item.
    const newItem = { name: 'newItem', done: false }
    const createNewResponse = await request(tembaServer).post(resource).send(newItem)
    const createdNewItem = createNewResponse.body
    expect(createNewResponse.status).toBe(201)
    expect(createdNewItem.name).toBe('newItem')
    expect(createdNewItem.done).toBe(false)
    expect(createNewResponse.header.location.endsWith(resource + createdNewItem.id)).toBe(true)

    // Now there is one item. Get all items.
    const getAllOneItemResponse = await request(tembaServer).get(resource)
    expect(getAllOneItemResponse.status).toBe(200)
    expect(getAllOneItemResponse.body.length).toBe(1)
    expect(getAllOneItemResponse.body[0].name).toBe('newItem')
    expect(getAllOneItemResponse.body[0].id).toBe(createdNewItem.id)

    // Get one item by ID.
    const getJustOneItemResponse = await request(tembaServer).get(resource + createdNewItem.id)
    expect(getJustOneItemResponse.status).toBe(200)
    expect(getJustOneItemResponse.body.name).toBe('newItem')
    expect(getJustOneItemResponse.body.id).toBe(createdNewItem.id)

    // Replace (PUT) one item by ID.
    // Here we add the field "hello" and "foo", and remove the field "done"
    const replacedItem = { name: 'replacedItem', hello: 'world', foo: 'bar' }
    const replaceResponse = await request(tembaServer)
      .put(resource + createdNewItem.id)
      .send(replacedItem)

    expect(replaceResponse.status).toBe(200)
    expect(replaceResponse.body.name).toBe('replacedItem')
    expect(replaceResponse.body.hello).toEqual('world')
    expect(replaceResponse.body.foo).toEqual('bar')
    expect(replaceResponse.body.done).toBeUndefined()
    expect(replaceResponse.body.id).toEqual(createdNewItem.id)

    // Get one item by ID.
    const getJustOneReplacedItemResponse = await request(tembaServer).get(
      resource + createdNewItem.id,
    )
    expect(getJustOneReplacedItemResponse.status).toBe(200)
    expect(getJustOneReplacedItemResponse.body.name).toBe('replacedItem')
    expect(getJustOneReplacedItemResponse.body.hello).toEqual('world')
    expect(getJustOneReplacedItemResponse.body.foo).toEqual('bar')
    expect(getJustOneReplacedItemResponse.body.id).toBe(createdNewItem.id)

    // Update (PATCH) one item by ID.
    // Here we update the "name", add the "something" field, clear the "foo" field, and leave all other properties unchanged.
    const updatedItem = { name: 'updatedItem', something: 'in the way', foo: null }
    const updateResponse = await request(tembaServer)
      .patch(resource + createdNewItem.id)
      .send(updatedItem)
    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.name).toBe('updatedItem')
    expect(updateResponse.body.hello).toEqual('world')
    expect(updateResponse.body.something).toEqual('in the way')
    expect(updateResponse.body.foo).toBeNull()
    expect(updateResponse.body.id).toEqual(createdNewItem.id)

    // Get one item by ID.
    const getJustOneUpdatedItemResponse = await request(tembaServer).get(
      resource + createdNewItem.id,
    )
    expect(getJustOneUpdatedItemResponse.status).toBe(200)
    expect(getJustOneUpdatedItemResponse.body.name).toBe('updatedItem')
    expect(getJustOneUpdatedItemResponse.body.hello).toEqual('world')
    expect(getJustOneUpdatedItemResponse.body.something).toEqual('in the way')
    expect(getJustOneUpdatedItemResponse.body.foo).toBeNull()
    expect(getJustOneUpdatedItemResponse.body.id).toBe(createdNewItem.id)

    // Delete one item by ID.
    const deleteResponse = await request(tembaServer).delete(resource + createdNewItem.id)
    expect(deleteResponse.status).toBe(204)

    // Get one item by ID.
    const getJustDeletedItemResponse = await request(tembaServer).get(resource + createdNewItem.id)
    expect(getJustDeletedItemResponse.status).toBe(404)

    // Check there are no items anymore.
    const getAllResponse3 = await request(tembaServer).get(resource)
    expect(getAllResponse3.status).toBe(200)
    expect(getAllResponse2.body.length).toBe(0)
  })

  test('When POSTing and PUTting with ID in request body, ignore ID in body', async () => {
    const hardCodedIdToIgnore = 'myID'

    // Initially, there are no items so a get all returns an empty array.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.status).toBe(200)
    expect(getAllResponse.body.length).toBe(0)

    // Create a new item, but ignore the ID in the request body.
    const newItem = { id: hardCodedIdToIgnore, name: 'newItem' }
    const createNewResponse = await request(tembaServer).post(resource).send(newItem)
    const newCreatedItem = createNewResponse.body
    expect(createNewResponse.status).toBe(201)
    expect(newCreatedItem.name).toBe('newItem')
    expect(newCreatedItem.id.length).toBeGreaterThan(0)
    expect(newCreatedItem.id).not.toEqual(hardCodedIdToIgnore)

    // Replace one item by ID in the URI and ignore the ID in the request body.
    const replacedItem = { id: hardCodedIdToIgnore, name: 'replacedItem' }
    const replaceResponse = await request(tembaServer)
      .put(resource + newCreatedItem.id)
      .send(replacedItem)
    expect(replaceResponse.status).toBe(200)
    expect(replaceResponse.body.name).toBe('replacedItem')
    expect(replaceResponse.body.id).toEqual(newCreatedItem.id)

    // Update one item by ID in the URI and ignore the ID in the request body.
    const updatedItem = { id: hardCodedIdToIgnore, name: 'updatedItem' }
    const updateResponse = await request(tembaServer)
      .put(resource + newCreatedItem.id)
      .send(updatedItem)
    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.name).toBe('updatedItem')
    expect(updateResponse.body.id).toEqual(newCreatedItem.id)

    // Now there is one item. Get all items.
    const getAllOneItemResponse = await request(tembaServer).get(resource)
    expect(getAllOneItemResponse.status).toBe(200)
    expect(getAllOneItemResponse.body.length).toBe(1)
    expect(getAllOneItemResponse.body[0].name).toBe('updatedItem')
    expect(getAllOneItemResponse.body[0].id).toBe(newCreatedItem.id)
  })

  test('DELETE on resource URL (without ID) deletes all resources', async () => {
    // Create 2 new items.
    const createNewResponse1 = await request(tembaServer).post(resource).send({ name: 'item 1' })
    expect(createNewResponse1.status).toBe(201)
    const item1Id = createNewResponse1.body.id
    const createNewResponse2 = await request(tembaServer).post(resource).send({ name: 'item 2' })
    expect(createNewResponse2.status).toBe(201)
    const item2Id = createNewResponse2.body.id

    // Get all items, there should be 2.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.status).toBe(200)
    expect(getAllResponse.body.length).toBe(2)
    expect(getAllResponse.body[0].id).toBe(item1Id)
    expect(getAllResponse.body[1].id).toBe(item2Id)

    // Delete all items with a DELETE call on the resource URL instead of an ID.
    const deleteResponse = await request(tembaServer).delete(resource)
    expect(deleteResponse.status).toBe(204)

    // Get all items, there should be 0.
    const getAllResponse2 = await request(tembaServer).get(resource)
    expect(getAllResponse2.status).toBe(200)
    expect(getAllResponse2.body.length).toBe(0)
  })
})
