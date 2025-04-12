import { test, expect, describe } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../src/config'
import { createServer } from './createServer'
import { expectSuccess } from './helpers'

/*
  Tests etag behavior when configured.
*/

const resource = '/items/'

describe('GET/HEAD If-None-Match header', () => {
  test.each(['GET', 'HEAD'])('%s does not return an etag header by default', async (method) => {
    const tembaServer = createServer()
    const response = await request(tembaServer)[method.toLowerCase()](resource)

    expect(response.headers['etag']).toBeUndefined()
    expect(response.statusCode).toEqual(200)
  })

  test.each(['GET', 'HEAD'])('%s returns an etag header when configured', async (method) => {
    const tembaServer = createServer({ etags: true } satisfies UserConfig)
    const response = await request(tembaServer)[method.toLowerCase()](resource)

    expect(response.headers['etag']).toBeDefined()
    expect(response.statusCode).toEqual(200)
  })

  test.each(['GET', 'HEAD'])(
    '%s only returns a different etag if the resource changed',
    async (method) => {
      const tembaServer = createServer({ etags: true } satisfies UserConfig)

      // Create a resource
      const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
      expectSuccess(postResponse)
      const id = postResponse.body.id

      // Get the created resource
      const getResponse = await request(tembaServer)[method.toLowerCase()](resource + id)
      expectSuccess(getResponse)
      const etag1 = getResponse.headers['etag']

      // Get the created resource again
      const getResponse2 = await request(tembaServer)[method.toLowerCase()](resource + id)
      expectSuccess(getResponse2)
      const etag2 = getResponse2.headers['etag']

      // The etags should be the same
      expect(etag1).toEqual(etag2)

      // Update the resource
      const putResponse = await request(tembaServer)
        .put(resource + id)
        .send({ name: 'item 2' })
        .set('If-Match', etag1)
      expectSuccess(putResponse)

      // Get the resource again
      const getResponse3 = await request(tembaServer)[method.toLowerCase()](resource + id)
      expectSuccess(getResponse3)
      const etag3 = getResponse3.headers['etag']

      // The etags should be different
      expect(etag1).not.toEqual(etag3)
    },
  )

  test.each(['GET', 'HEAD'])(
    '%s with If-None-Match returns 304 Not Modified if etag is the same',
    async (method) => {
      const tembaServer = createServer({ etags: true } satisfies UserConfig)

      // Create a resource
      const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
      expectSuccess(postResponse)
      const id = postResponse.body.id

      // Get the created resource
      const getResponse = await request(tembaServer)[method.toLowerCase()](resource + id)
      expectSuccess(getResponse)
      const etag = getResponse.headers['etag']
      // Get the resource again with the etag
      const getResponse2 = await request(tembaServer)
        [method.toLowerCase()](resource + id)
        .set('If-None-Match', etag)
      expect(getResponse2.statusCode).toEqual(304)

      // Update the resource
      const putResponse = await request(tembaServer)
        .put(resource + id)
        .send({ name: 'item 2' })
        .set('If-Match', etag)
      expectSuccess(putResponse)

      // Get the resource again with the etag from the GET before the update
      const getResponse3 = await request(tembaServer)
        [method](resource + id)
        .set('If-None-Match', etag)
      expectSuccess(getResponse3)
      expect(getResponse3.statusCode).toEqual(200)
      if (method === 'get') expect(getResponse3.body.name).toEqual('item 2')
    },
  )
})

describe('PUT/PATCH/DELETE If-Match header', () => {
  test('PUT requires an If-Match header with an up to date etag', async () => {
    const tembaServer = createServer({ etags: true } satisfies UserConfig)

    // Create a resource
    const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
    expectSuccess(postResponse)
    const id = postResponse.body.id

    // Get the created resource
    const getResponse = await request(tembaServer).get(resource + id)
    expectSuccess(getResponse)
    const etag = getResponse.headers['etag']

    // Try to update the resource without an If-Match header, which is not allowed
    const putResponse = await request(tembaServer)
      .put(resource + id)
      .send({ name: 'item 2' })
    expect(putResponse.statusCode).toEqual(412)

    // Now try to update the resource with the etag, which should work
    const putResponse2 = await request(tembaServer)
      .put(resource + id)
      .send({ name: 'item 3' })
      .set('If-Match', etag)
    expectSuccess(putResponse2)

    // Try to update the resource again, but now with the old etag, which is also not allowed
    const putResponse3 = await request(tembaServer)
      .put(resource + id)
      .send({ name: 'item 4' })
      .set('If-Match', etag)
    expect(putResponse3.statusCode).toEqual(412)

    // If we get the resource again, it should have a new etag
    const getResponse2 = await request(tembaServer).get(resource + id)
    expectSuccess(getResponse2)
    const etag2 = getResponse2.headers['etag']
    expect(etag).not.toEqual(etag2)
  })

  test('PATCH requires an If-Match header with an up to date etag', async () => {
    const tembaServer = createServer({ etags: true } satisfies UserConfig)

    // Create a resource
    const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
    expectSuccess(postResponse)
    const id = postResponse.body.id

    // Get the created resource
    const getResponse = await request(tembaServer).get(resource + id)
    expectSuccess(getResponse)
    const etag = getResponse.headers['etag']

    // Try to update the resource without an If-Match header, which is not allowed
    const patchResponse = await request(tembaServer)
      .patch(resource + id)
      .send({ name: 'item 2' })
    expect(patchResponse.statusCode).toEqual(412)

    // Now try to update the resource with the etag, which should work
    const patchResponse2 = await request(tembaServer)
      .patch(resource + id)
      .send({ name: 'item 3' })
      .set('If-Match', etag)
    expectSuccess(patchResponse2)

    // Try to update the resource again, but now with the old etag, which is also not allowed
    const patchResponse3 = await request(tembaServer)
      .patch(resource + id)
      .send({ name: 'item 4' })
      .set('If-Match', etag)
    expect(patchResponse3.statusCode).toEqual(412)

    // If we get the resource again, it should have a new etag
    const getResponse2 = await request(tembaServer).get(resource + id)
    expectSuccess(getResponse2)
    const etag2 = getResponse2.headers['etag']
    expect(etag).not.toEqual(etag2)
  })

  test('DELETE an item requires an If-Match header with an up to date etag', async () => {
    const tembaServer = createServer({ etags: true } satisfies UserConfig)

    // Create a resource
    const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
    expectSuccess(postResponse)
    const id = postResponse.body.id

    // Get the created resource
    const getResponse = await request(tembaServer).get(resource + id)
    expectSuccess(getResponse)
    const etag = getResponse.headers['etag']

    // Try to delete the resource without an If-Match header, which is not allowed
    const deleteResponse = await request(tembaServer).delete(resource + id)
    expect(deleteResponse.statusCode).toEqual(412)

    // Now try to delete the resource with the etag, which should work
    const deleteResponse2 = await request(tembaServer)
      .delete(resource + id)
      .set('If-Match', etag)
    expectSuccess(deleteResponse2)

    // Try to delete the resource again, which is fine because it's already gone
    const deleteResponse3 = await request(tembaServer)
      .delete(resource + id)
      .set('If-Match', etag)
    expect(deleteResponse3.statusCode).toEqual(204)
  })

  test('DELETE a collection requires an If-Match header with an up to date etag', async () => {
    const tembaServer = createServer({
      etags: true,
      allowDeleteCollection: true,
    } satisfies UserConfig)

    // Create a resource
    const postResponse = await request(tembaServer).post(resource).send({ name: 'item 1' })
    expectSuccess(postResponse)

    // GET the collection
    const getResponse = await request(tembaServer).get(resource)
    expectSuccess(getResponse)
    const etag = getResponse.headers['etag']

    // Try to delete the collection without an If-Match header, which is not allowed
    const deleteResponse = await request(tembaServer).delete(resource)
    expect(deleteResponse.statusCode).toEqual(412)

    // Now try to delete the collection with the etag, which should work
    const deleteResponse2 = await request(tembaServer).delete(resource).set('If-Match', etag)
    expectSuccess(deleteResponse2)

    // Try to delete the resource again, but now with the old etag, which is also not allowed
    const deleteResponse3 = await request(tembaServer).delete(resource).set('If-Match', etag)
    expect(deleteResponse3.statusCode).toEqual(412)

    // If we get the collection again, it should have a new etag
    const getResponse2 = await request(tembaServer).get(resource)
    expectSuccess(getResponse2)
    const etag2 = getResponse2.headers['etag']
    expect(etag).not.toEqual(etag2)
  })
})
