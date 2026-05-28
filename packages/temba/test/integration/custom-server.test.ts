// @custom-server
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { CUSTOM_ROUTE, CUSTOM_ROUTE_BODY, CUSTOM_ROUTE_CONTENT_TYPE, createServer } from './createServer'

const isCustomServerTest = !!process.env.TEMBA_CUSTOM_SERVER

describe.skipIf(!isCustomServerTest)('Custom server wrapping Temba', () => {
  test('Custom route returns the expected non-JSON plain text response', async () => {
    const server = await createServer()

    const res = await request(server).get(CUSTOM_ROUTE)

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(CUSTOM_ROUTE_CONTENT_TYPE)
    expect(res.text).toBe(CUSTOM_ROUTE_BODY)
  })

  test('Custom route does not fall through to Temba (no 404)', async () => {
    const server = await createServer()

    const res = await request(server).get(CUSTOM_ROUTE)

    expect(res.status).not.toBe(404)
  })

  test('Unknown route is delegated to Temba and returns 404', async () => {
    // Configure a specific resource list so Temba returns 404 for unknown resources
    const server = await createServer({ resources: ['movies'] })

    const res = await request(server).get('/this-route-does-not-exist')

    expect(res.status).toBe(404)
  })
})
