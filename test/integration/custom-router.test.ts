import request from 'supertest'
import express from 'express'
import type { Config } from '../../src/config'
import createServer from './createServer'
import { describe, test, expect } from 'vitest'

describe('Configuring only a customRouter', () => {
  const customRouter = express.Router()
  customRouter.get('/', async (_, res) => {
    return res.send('Overriding the root URL should not be possible...')
  })
  customRouter.get('/hello', async (_, res) => {
    return res.send('Hello, World!')
  })

  const tembaServer = createServer({ customRouter } as unknown as Config)

  test("Temba's root URL takes presedence over a root URL in a customRouter", async () => {
    // The root URL is controlled by Temba, so the custom router's root URL is ignored.
    const rootResponse = await request(tembaServer).get('/')
    expect(rootResponse.statusCode).toEqual(200)
    expect(rootResponse.text).toEqual('It works! ツ')

    // As we did not configure resources, any resource route is handled by Temba and return an empty array.
    const getAllResponse = await request(tembaServer).get('/stuff')
    expect(getAllResponse.status).toBe(200)
    expect(getAllResponse.body.length).toBe(0)

    // However, the /hello route is configured through a custom Express router,
    // so it overrides the Temba route.
    const response = await request(tembaServer).get('/hello')
    expect(response.statusCode).toEqual(200)
    expect(response.text).toEqual('Hello, World!')
  })
})

describe('Configuring customRouter + resources', () => {
  const customRouter = express.Router()
  customRouter.get('/hello', async (_, res) => {
    return res.send('Hello, World!')
  })

  const tembaServer = createServer({
    customRouter,
    resources: ['hello'],
  } as unknown as Config)

  test('customRouter takes presedence over resources', async () => {
    // The /hello route is configured both through a custom Express router,
    // and as resource, but the customRouter overrides the Temba route.
    const response = await request(tembaServer).get('/hello')
    expect(response.statusCode).toEqual(200)
    expect(response.text).toEqual('Hello, World!')
  })

  describe('Configuring customRouter + apiPrefix', () => {
    const customRouter = express.Router()
    customRouter.get('/hello', async (_, res) => {
      return res.send('Hello, World!')
    })
    customRouter.get('/api/goodbye', async (_, res) => {
      return res.send('Goodbye, World!')
    })

    const tembaServer = createServer({
      apiPrefix: '/api',
      customRouter,
    } as unknown as Config)

    test('customRouter takes presedence over apiPrefix routes', async () => {
      // As we did not configure resources, any resource route through the apiPrefix is handled by Temba and return an empty array.
      const getAllResponse = await request(tembaServer).get('/api/hello')
      expect(getAllResponse.status).toBe(200)
      expect(getAllResponse.body.length).toBe(0)

      // The /hello route is is from customRouter, and outside the apiPrefix path, so still works with customRouter.
      const response2 = await request(tembaServer).get('/hello')
      expect(response2.statusCode).toEqual(200)
      expect(response2.text).toEqual('Hello, World!')

      // The /api/goodbye route is from customRouter, and also within the apiPrefix path, but still uses the customRouter's implementation.
      const customRouterresponse = await request(tembaServer).get('/api/goodbye')
      expect(customRouterresponse.statusCode).toEqual(200)
      expect(customRouterresponse.text).toEqual('Goodbye, World!')
    })
  })
})
