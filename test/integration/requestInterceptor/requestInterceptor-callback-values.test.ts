import { test, assert } from 'vitest'
import request from 'supertest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'
import { RequestInterceptor } from '../../../src/requestInterceptor/types'

type MyBody = { name: string }

const requestInterceptor = {
  post: ({ resource, body }) => {
    assert(resource === 'post-stuff')
    assert((body as MyBody).name === 'post-name')
  },
  put: ({ resource, id, body }) => {
    assert(resource === 'put-stuff')
    assert(id === 'put-id')
    assert((body as MyBody).name === 'put-name')
  },
  patch: ({ resource, id, body }) => {
    assert(resource === 'patch-stuff')
    assert(id === 'patch-id')
    assert((body as MyBody).name === 'patch-name')
  },
} satisfies RequestInterceptor

const tembaServer = createServer({ requestInterceptor } satisfies UserConfig)

test('requestInterceptors supply correct values to callback function', async () => {
  await request(tembaServer).post('/post-stuff').send({ name: 'post-name' })

  await request(tembaServer).put('/put-stuff/put-id').send({ name: 'put-name' })

  await request(tembaServer).patch('/patch-stuff/patch-id').send({ name: 'patch-name' })
})
