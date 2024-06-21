import { test, expect } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'
import { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { TembaError } from '../../../src'

type MyBody = { name: string }

const requestInterceptor = {
  get: ({ resource, id }) => {
    if (resource !== 'get-stuff') throw new TembaError('resource is not get-stuff', 400)
    if (id !== 'get-id') throw new TembaError('id is not get-id', 400)
    throw new TembaError('GET is OK', 200)
  },
  post: ({ resource, body }) => {
    if (resource !== 'post-stuff') throw new TembaError('resource is not post-stuff', 400)
    if ((body as MyBody).name !== 'post-name')
      throw new TembaError('body does not have post-name', 400)
    throw new TembaError('POST is OK', 200)
  },
  put: ({ resource, id, body }) => {
    if (resource !== 'put-stuff') throw new TembaError('resource is not put-stuff', 400)
    if (id !== 'put-id') throw new TembaError('id is not put-id', 400)
    if ((body as MyBody).name !== 'put-name')
      throw new TembaError('body does not have put-name', 400)
    throw new TembaError('PUT is OK', 200)
  },
  patch: ({ resource, id, body }) => {
    if (resource !== 'patch-stuff') throw new TembaError('resource is not patch-stuff', 400)
    if (id !== 'patch-id') throw new TembaError('id is not patch-id', 400)
    if ((body as MyBody).name !== 'patch-name')
      throw new TembaError('body does not have patch-name', 400)
    throw new TembaError('PATCH is OK', 200)
  },
  delete: ({ resource, id }) => {
    if (resource !== 'delete-stuff') throw new TembaError('resource is not delete-stuff', 400)
    if (id !== 'delete-id') throw new TembaError('id is not delete-id', 400)
    throw new TembaError('DELETE is OK', 200)
  },
} satisfies RequestInterceptor

const tembaServer = createServer({ requestInterceptor } satisfies UserConfig)

test('requestInterceptors supply correct values to callback function', async () => {
  const getResponse = await request(tembaServer).get('/get-stuff/get-id')
  expect(getResponse.status).toBe(200)
  expect(getResponse.body).toEqual({ message: 'GET is OK' })

  // HEAD requests have no specific implementation, so will not go through a requestInterceptor
  const headResponse = await request(tembaServer).head('/head-stuff')
  expect(headResponse.status).toBe(200)
  expect(headResponse.body).toEqual({})

  const postResponse = await request(tembaServer).post('/post-stuff').send({ name: 'post-name' })
  expect(postResponse.status).toBe(200)
  expect(postResponse.body).toEqual({ message: 'POST is OK' })

  const putResponse = await request(tembaServer).put('/put-stuff/put-id').send({ name: 'put-name' })
  expect(putResponse.status).toBe(200)
  expect(putResponse.body).toEqual({ message: 'PUT is OK' })

  const patchResponse = await request(tembaServer)
    .patch('/patch-stuff/patch-id')
    .send({ name: 'patch-name' })
  expect(patchResponse.status).toBe(200)
  expect(patchResponse.body).toEqual({ message: 'PATCH is OK' })

  const deleteResponse = await request(tembaServer).delete('/delete-stuff/delete-id')
  expect(deleteResponse.status).toBe(200)
  expect(deleteResponse.body).toEqual({ message: 'DELETE is OK' })
})
