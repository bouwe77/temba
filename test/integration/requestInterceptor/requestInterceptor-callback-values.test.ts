import { test, expect, describe } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import { createHttpServer } from '../createServer'
import { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { TembaError } from '../../../src'

// Tests if the request is correctly passed on to the requestInterceptor callback

// Note how we test the requestInterceptors in isolation by always throwing a TembaError.
// This way, the request will not be handled by Temba any further and we are sure that the response
// is defined by the requestInterceptors only.

type MyBody = { name: string }

const requestInterceptor = {
  get: ({ headers, resource, id }) => {
    if (headers['x-foo'] !== 'GET') throw new TembaError('header is not GET', 400)
    if (resource !== 'get-stuff') throw new TembaError('resource is not get-stuff', 400)
    if (id !== 'get-id') throw new TembaError('id is not get-id', 400)
    throw new TembaError('GET is OK', 200)
  },
  post: ({ headers, resource, body }) => {
    if (headers['x-foo'] !== 'POST') throw new TembaError('header is not POST', 400)
    if (resource !== 'post-stuff') throw new TembaError('resource is not post-stuff', 400)
    if ((body as MyBody).name !== 'post-name')
      throw new TembaError('body does not have post-name', 400)
    throw new TembaError('POST is OK', 200)
  },
  put: ({ headers, resource, id, body }) => {
    if (headers['x-foo'] !== 'PUT') throw new TembaError('header is not PUT', 400)
    if (resource !== 'put-stuff') throw new TembaError('resource is not put-stuff', 400)
    if (id !== 'put-id') throw new TembaError('id is not put-id', 400)
    if ((body as MyBody).name !== 'put-name')
      throw new TembaError('body does not have put-name', 400)
    throw new TembaError('PUT is OK', 200)
  },
  patch: ({ headers, resource, id, body }) => {
    if (headers['x-foo'] !== 'PATCH') throw new TembaError('header is not PATCH', 400)
    if (resource !== 'patch-stuff') throw new TembaError('resource is not patch-stuff', 400)
    if (id !== 'patch-id') throw new TembaError('id is not patch-id', 400)
    if ((body as MyBody).name !== 'patch-name')
      throw new TembaError('body does not have patch-name', 400)
    throw new TembaError('PATCH is OK', 200)
  },
  delete: ({ headers, resource, id }) => {
    if (headers['x-foo'] !== 'DELETE') throw new TembaError('header is not DELETE', 400)
    if (resource !== 'delete-stuff') throw new TembaError('resource is not delete-stuff', 400)
    if (id !== 'delete-id') throw new TembaError('id is not delete-id', 400)
    throw new TembaError('DELETE is OK', 200)
  },
} satisfies RequestInterceptor

const tembaServer = createHttpServer({ requestInterceptor } satisfies UserConfig)

describe('Request is correctly passed through to the requestInterceptor callback functions', () => {
  test.skip('GET - requestInterceptor callback function', async () => {
    const getResponse = await request(tembaServer).get('/get-stuff/get-id').set('x-foo', 'GET')
    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toEqual({ message: 'GET is OK' })
  })

  test.skip('HEAD requests have no specific implementation, so will not go through a requestInterceptor', async () => {
    const headResponse = await request(tembaServer).head('/head-stuff')
    expect(headResponse.status).toBe(200)
    expect(headResponse.body).toEqual({})
  })

  test.skip('POST - requestInterceptor callback function', async () => {
    const postResponse = await request(tembaServer)
      .post('/post-stuff')
      .send({ name: 'post-name' })
      .set('x-foo', 'POST')
    expect(postResponse.status).toBe(200)
    expect(postResponse.body).toEqual({ message: 'POST is OK' })
  })

  test.skip('PUT - requestInterceptor callback function', async () => {
    const putResponse = await request(tembaServer)
      .put('/put-stuff/put-id')
      .send({ name: 'put-name' })
      .set('x-foo', 'PUT')
    expect(putResponse.status).toBe(200)
    expect(putResponse.body).toEqual({ message: 'PUT is OK' })
  })

  test.skip('PATCH - requestInterceptor callback function', async () => {
    const patchResponse = await request(tembaServer)
      .patch('/patch-stuff/patch-id')
      .send({ name: 'patch-name' })
      .set('x-foo', 'PATCH')
    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body).toEqual({ message: 'PATCH is OK' })
  })

  test.skip('DELETE - requestInterceptor callback function', async () => {
    const deleteResponse = await request(tembaServer)
      .delete('/delete-stuff/delete-id')
      .set('x-foo', 'DELETE')
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body).toEqual({ message: 'DELETE is OK' })
  })
})
