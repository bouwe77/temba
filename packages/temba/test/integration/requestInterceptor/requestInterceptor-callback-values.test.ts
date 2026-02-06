import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { createServer } from '../createServer'

// Tests if the request is correctly passed on to the requestInterceptor callback

// Note how we test the requestInterceptors in isolation by using actions.response().
// This way, the request will not be handled by Temba any further and we are sure that the response
// is defined by the requestInterceptors only.

type MyBody = { name: string }

const requestInterceptor = {
  get: ({ headers, resource, id }, actions) => {
    if (headers['x-foo'] !== 'GET')
      return actions.response({ status: 400, body: { message: 'header is not GET' } })
    if (resource !== 'get-stuff')
      return actions.response({ status: 400, body: { message: 'resource is not get-stuff' } })
    if (id !== 'get-id')
      return actions.response({ status: 400, body: { message: 'id is not get-id' } })
    return actions.response({ status: 200, body: { message: 'GET is OK' } })
  },
  post: ({ headers, resource, body }, actions) => {
    if (headers['x-foo'] !== 'POST')
      return actions.response({ status: 400, body: { message: 'header is not POST' } })
    if (resource !== 'post-stuff')
      return actions.response({ status: 400, body: { message: 'resource is not post-stuff' } })
    if ((body as MyBody).name !== 'post-name')
      return actions.response({ status: 400, body: { message: 'body does not have post-name' } })
    return actions.response({ status: 200, body: { message: 'POST is OK' } })
  },
  put: ({ headers, resource, id, body }, actions) => {
    if (headers['x-foo'] !== 'PUT')
      return actions.response({ status: 400, body: { message: 'header is not PUT' } })
    if (resource !== 'put-stuff')
      return actions.response({ status: 400, body: { message: 'resource is not put-stuff' } })
    if (id !== 'put-id')
      return actions.response({ status: 400, body: { message: 'id is not put-id' } })
    if ((body as MyBody).name !== 'put-name')
      return actions.response({ status: 400, body: { message: 'body does not have put-name' } })
    return actions.response({ status: 200, body: { message: 'PUT is OK' } })
  },
  patch: ({ headers, resource, id, body }, actions) => {
    if (headers['x-foo'] !== 'PATCH')
      return actions.response({ status: 400, body: { message: 'header is not PATCH' } })
    if (resource !== 'patch-stuff')
      return actions.response({ status: 400, body: { message: 'resource is not patch-stuff' } })
    if (id !== 'patch-id')
      return actions.response({ status: 400, body: { message: 'id is not patch-id' } })
    if ((body as MyBody).name !== 'patch-name')
      return actions.response({ status: 400, body: { message: 'body does not have patch-name' } })
    return actions.response({ status: 200, body: { message: 'PATCH is OK' } })
  },
  delete: ({ headers, resource, id }, actions) => {
    if (headers['x-foo'] !== 'DELETE')
      return actions.response({ status: 400, body: { message: 'header is not DELETE' } })
    if (resource !== 'delete-stuff')
      return actions.response({ status: 400, body: { message: 'resource is not delete-stuff' } })
    if (id !== 'delete-id')
      return actions.response({ status: 400, body: { message: 'id is not delete-id' } })
    return actions.response({ status: 200, body: { message: 'DELETE is OK' } })
  },
} satisfies RequestInterceptor

const tembaServer = await createServer({
  requestInterceptor,
})

describe('Request is correctly passed through to the requestInterceptor callback functions', () => {
  test('GET - requestInterceptor callback function', async () => {
    const getResponse = await request(tembaServer).get('/get-stuff/get-id').set('x-foo', 'GET')
    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toEqual({ message: 'GET is OK' })
  })

  test('HEAD requests have no specific implementation, so will not go through a requestInterceptor', async () => {
    const headResponse = await request(tembaServer).head('/head-stuff')
    expect(headResponse.status).toBe(200)
    expect(headResponse.body).toEqual({})
  })

  test('POST - requestInterceptor callback function', async () => {
    const postResponse = await request(tembaServer)
      .post('/post-stuff')
      .send({ name: 'post-name' })
      .set('x-foo', 'POST')
    expect(postResponse.status).toBe(200)
    expect(postResponse.body).toEqual({ message: 'POST is OK' })
  })

  test('PUT - requestInterceptor callback function', async () => {
    const putResponse = await request(tembaServer)
      .put('/put-stuff/put-id')
      .send({ name: 'put-name' })
      .set('x-foo', 'PUT')
    expect(putResponse.status).toBe(200)
    expect(putResponse.body).toEqual({ message: 'PUT is OK' })
  })

  test('PATCH - requestInterceptor callback function', async () => {
    const patchResponse = await request(tembaServer)
      .patch('/patch-stuff/patch-id')
      .send({ name: 'patch-name' })
      .set('x-foo', 'PATCH')
    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body).toEqual({ message: 'PATCH is OK' })
  })

  test('DELETE - requestInterceptor callback function', async () => {
    const deleteResponse = await request(tembaServer)
      .delete('/delete-stuff/delete-id')
      .set('x-foo', 'DELETE')
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body).toEqual({ message: 'DELETE is OK' })
  })
})
