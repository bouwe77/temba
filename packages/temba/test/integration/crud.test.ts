import { describe, test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

/*
  Tests for a CRUD roundtrip along all supported HTTP methods.
*/

describe('CRUD', () => {
  // This Temba server is created with the default configuration, i.e. no config object is supplied.
  const tembaServer = createServer()

  const resource = '/articles/'

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
    expect(createNewResponse.header.location?.endsWith(resource + createdNewItem.id)).toBe(true)

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
})

describe('POST user-defined IDs', () => {
  test('Create items with both generated and user-defined IDs', async () => {
    const tembaServer = createServer()
    const resource = '/items/'
    // Get all items, there should be 0.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toBe(0)

    // Create a new item, without an id in the resource, so it should be generated by the API.
    const createResponse88 = await request(tembaServer).post(resource).send({ name: 'item 1' })
    const generatedId = createResponse88.body.id

    // Create a new item with a user-defined ID.
    const userDefinedId = 'user_defined_id'
    const createResponse2 = await request(tembaServer)
      .post(resource + userDefinedId)
      .send({ name: 'item 2' })
    expect(createResponse2.status).toBe(201)
    expect(createResponse2.body.id).toBe(userDefinedId)
    expect(createResponse2.header.location?.endsWith(resource + userDefinedId)).toBe(true)

    // Get all items, there should be 2.
    const getAllResponse3 = await request(tembaServer).get(resource)
    const items = getAllResponse3.body
    expect(items.length).toBe(2)
    expect(items).toContainEqual({ id: generatedId, name: 'item 1' })
    expect(items).toContainEqual({ id: userDefinedId, name: 'item 2' })

    // Get both items individually
    const getResponse1 = await request(tembaServer).get(resource + generatedId)
    expect(getResponse1.body).toEqual({ id: generatedId, name: 'item 1' })
    const getResponse2 = await request(tembaServer).get(resource + userDefinedId)
    expect(getResponse2.body).toEqual({ id: userDefinedId, name: 'item 2' })
  })

  test('Creating an item with an existing ID returns 409 Conflict', async () => {
    const tembaServer = createServer()
    const resource = '/items/'
    // Create a new item with a user-defined ID.
    const userDefinedId = 'user_defined_id'
    const createResponse = await request(tembaServer)
      .post(resource + userDefinedId)
      .send({ name: 'item 1' })
    expect(createResponse.status).toBe(201)

    // Create a new item with the same user-defined ID.
    const createResponse2 = await request(tembaServer)
      .post(resource + userDefinedId)
      .send({ name: 'item 2' })
    expect(createResponse2.status).toBe(409)
    expect(createResponse2.body).toEqual({ message: `ID '${userDefinedId}' already exists` })
  })
})

describe('DELETE collection', () => {
  test('DELETE on resource URL (without ID) by default returns 405 Method Not Allowed and does not delete anything', async () => {
    const tembaServer = createServer()
    const resource = '/articles/'

    // Get all items, there should be 0.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toBe(0)

    // Create 2 new items.
    await request(tembaServer).post(resource).send({ name: 'item 1' })
    await request(tembaServer).post(resource).send({ name: 'item 2' })

    // Get all items, there should be 2.
    const getAllResponse2 = await request(tembaServer).get(resource)
    expect(getAllResponse2.body.length).toBe(2)

    // Delete all items with a DELETE call on the resource URL instead of an ID.
    const deleteResponse = await request(tembaServer).delete(resource)
    expect(deleteResponse.status).toBe(405)

    // Get all items, there should still be 2.
    const getAllResponse3 = await request(tembaServer).get(resource)
    expect(getAllResponse3.body.length).toBe(2)
  })

  test('DELETE on resource URL (without ID) deletes collection if allowDeleteCollection setting is set to true', async () => {
    const tembaServer = createServer({
      allowDeleteCollection: true,
    })
    const resource = '/articles/'

    // Get all items, there should be 0.
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toBe(0)

    // Create 2 new items.
    await request(tembaServer).post(resource).send({ name: 'item 1' })
    await request(tembaServer).post(resource).send({ name: 'item 2' })

    // Get all items, there should be 2.
    const getAllResponse2 = await request(tembaServer).get(resource)
    expect(getAllResponse2.body.length).toBe(2)

    // Delete all items with a DELETE call on the resource URL instead of an ID.
    const deleteResponse = await request(tembaServer).delete(resource)
    expect(deleteResponse.status).toBe(204)

    // Get all items, there should be none left.
    const getAllResponse3 = await request(tembaServer).get(resource)
    expect(getAllResponse3.body.length).toBe(0)
  })
})
