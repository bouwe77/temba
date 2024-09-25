import { describe, test, expect } from 'vitest'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests for a CRUD roundtrip along all supported HTTP methods.
*/

describe('CRUD', () => {
  // This Temba server is created with the default configuration, i.e. no config object is supplied.
  const tembaServer = createServer()

  const resource = '/articles/'

  test('hondenstront Read, create, replace, update and delete resources', async () => {
    // Initially, there are no items so a get all returns an empty array.
    const getAllResponse = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse.statusCode).toBe(200)
    expect(getAllResponse.body.length).toBe(0)
    // Initially, there are no items so a getting an id returns a 404.
    const getOneResponse = await sendRequest(tembaServer, 'get', resource + 'id_does_not_exist')
    expect(getOneResponse.statusCode).toBe(404)

    // Initially, there are no items so a replacing something by id returns a 404.
    const nonExistingItem = {
      name: 'this should fail',
    }
    const replaceNonExistingResponse = await sendRequest(
      tembaServer,
      'put',
      resource + 'id_does_not_exist',
      nonExistingItem,
    )
    expect(replaceNonExistingResponse.statusCode).toBe(404)

    // Initially, there are no items so a updating something by id returns a 404.
    const updateNonExistingResponse = await sendRequest(
      tembaServer,
      'patch',
      resource + 'id_does_not_exist',
      nonExistingItem,
    )
    expect(updateNonExistingResponse.statusCode).toBe(404)

    // Initially, there are no items, but deleting an id always returns a 204 anyway.
    const deleteNonExistingResponse = await sendRequest(
      tembaServer,
      'delete',
      resource + 'id_does_not_exist',
    )
    expect(deleteNonExistingResponse.statusCode).toBe(204)

    // Check again there are still no items.
    const getAllResponse2 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse2.statusCode).toBe(200)
    expect(getAllResponse2.body.length).toBe(0)

    // Create a new item.
    const newItem = { name: 'newItem', done: false }
    const createNewResponse = await sendRequest(tembaServer, 'post', resource, newItem)
    const createdNewItem = createNewResponse.body
    expect(createNewResponse.statusCode).toBe(201)
    expect(createdNewItem.name).toBe('newItem')
    expect(createdNewItem.done).toBe(false)

    //hier was ik gebleven: headers heeft een location property, maar als ik die opvraag is die undefined...

    console.log(createNewResponse.headers)
    expect(createNewResponse.headers['location']?.endsWith(resource + createdNewItem.id)).toBe(true)

    // Now there is one item. Get all items.
    const getAllOneItemResponse = await sendRequest(tembaServer, 'get', resource)
    expect(getAllOneItemResponse.statusCode).toBe(200)
    expect(getAllOneItemResponse.body.length).toBe(1)
    expect(getAllOneItemResponse.body[0].name).toBe('newItem')
    expect(getAllOneItemResponse.body[0].id).toBe(createdNewItem.id)

    // Get one item by ID.
    const getJustOneItemResponse = await sendRequest(
      tembaServer,
      'get',
      resource + createdNewItem.id,
    )
    expect(getJustOneItemResponse.statusCode).toBe(200)
    expect(getJustOneItemResponse.body.name).toBe('newItem')
    expect(getJustOneItemResponse.body.id).toBe(createdNewItem.id)

    // Replace (PUT) one item by ID.
    // Here we add the field "hello" and "foo", and remove the field "done"
    const replacedItem = { name: 'replacedItem', hello: 'world', foo: 'bar' }
    const replaceResponse = await sendRequest(
      tembaServer,
      'put',
      resource + createdNewItem.id,
      replacedItem,
    )

    expect(replaceResponse.statusCode).toBe(200)
    expect(replaceResponse.body.name).toBe('replacedItem')
    expect(replaceResponse.body.hello).toEqual('world')
    expect(replaceResponse.body.foo).toEqual('bar')
    expect(replaceResponse.body.done).toBeUndefined()
    expect(replaceResponse.body.id).toEqual(createdNewItem.id)

    // Get one item by ID.
    const getJustOneReplacedItemResponse = await sendRequest(
      tembaServer,
      'get',
      resource + createdNewItem.id,
    )
    expect(getJustOneReplacedItemResponse.statusCode).toBe(200)
    expect(getJustOneReplacedItemResponse.body.name).toBe('replacedItem')
    expect(getJustOneReplacedItemResponse.body.hello).toEqual('world')
    expect(getJustOneReplacedItemResponse.body.foo).toEqual('bar')
    expect(getJustOneReplacedItemResponse.body.id).toBe(createdNewItem.id)

    // Update (PATCH) one item by ID.
    // Here we update the "name", add the "something" field, clear the "foo" field, and leave all other properties unchanged.
    const updatedItem = { name: 'updatedItem', something: 'in the way', foo: null }
    const updateResponse = await sendRequest(
      tembaServer,
      'patch',
      resource + createdNewItem.id,
      updatedItem,
    )
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.body.name).toBe('updatedItem')
    expect(updateResponse.body.hello).toEqual('world')
    expect(updateResponse.body.something).toEqual('in the way')
    expect(updateResponse.body.foo).toBeNull()
    expect(updateResponse.body.id).toEqual(createdNewItem.id)

    // Get one item by ID.
    const getJustOneUpdatedItemResponse = await sendRequest(
      tembaServer,
      'get',
      resource + createdNewItem.id,
    )
    expect(getJustOneUpdatedItemResponse.statusCode).toBe(200)
    expect(getJustOneUpdatedItemResponse.body.name).toBe('updatedItem')
    expect(getJustOneUpdatedItemResponse.body.hello).toEqual('world')
    expect(getJustOneUpdatedItemResponse.body.something).toEqual('in the way')
    expect(getJustOneUpdatedItemResponse.body.foo).toBeNull()
    expect(getJustOneUpdatedItemResponse.body.id).toBe(createdNewItem.id)

    // Delete one item by ID.
    const deleteResponse = await sendRequest(tembaServer, 'delete', resource + createdNewItem.id)
    expect(deleteResponse.statusCode).toBe(204)

    // Get one item by ID.
    const getJustDeletedItemResponse = await sendRequest(
      tembaServer,
      'get',
      resource + createdNewItem.id,
    )
    expect(getJustDeletedItemResponse.statusCode).toBe(404)

    // Check there are no items anymore.
    const getAllResponse3 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse3.statusCode).toBe(200)
    expect(getAllResponse2.body.length).toBe(0)
  })
})

describe('DELETE collection', () => {
  test('DELETE on resource URL (without ID) by default returns 405 Method Not Allowed and does not delete anything', async () => {
    const tembaServer = createServer()
    const resource = '/articles/'

    // Get all items, there should be 0.
    const getAllResponse = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse.body.length).toBe(0)

    // Create 2 new items.
    await sendRequest(tembaServer, 'post', resource, { name: 'item 1' })
    await sendRequest(tembaServer, 'post', resource, { name: 'item 2' })

    // Get all items, there should be 2.
    const getAllResponse2 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse2.body.length).toBe(2)

    // Delete all items with a DELETE call on the resource URL instead of an ID.
    const deleteResponse = await sendRequest(tembaServer, 'delete', resource)
    expect(deleteResponse.statusCode).toBe(405)

    // Get all items, there should still be 2.
    const getAllResponse3 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse3.body.length).toBe(2)
  })

  test('DELETE on resource URL (without ID) deletes collection if allowDeleteCollection setting is set to true', async () => {
    const tembaServer = createServer({
      allowDeleteCollection: true,
    })
    const resource = '/articles/'

    // Get all items, there should be 0.
    const getAllResponse = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse.body.length).toBe(0)

    // Create 2 new items.
    await sendRequest(tembaServer, 'post', resource, { name: 'item 1' })
    await sendRequest(tembaServer, 'post', resource, { name: 'item 2' })

    // Get all items, there should be 2.
    const getAllResponse2 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse2.body.length).toBe(2)

    // Delete all items with a DELETE call on the resource URL instead of an ID.
    const deleteResponse = await sendRequest(tembaServer, 'delete', resource)
    expect(deleteResponse.statusCode).toBe(204)

    // Get all items, there should be none left.
    const getAllResponse3 = await sendRequest(tembaServer, 'get', resource)
    expect(getAllResponse3.body.length).toBe(0)
  })
})
