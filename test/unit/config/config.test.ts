import { test, expect } from 'vitest'
import { initConfig } from '../../../src/config'
import type { Config } from '../../../src/config'
import express from 'express'

const defaultConfig: Config = {
  resources: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: null,
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
  requestBodyInterceptor: null,
  responseBodyInterceptor: null,
  customRouter: null,
  returnNullFields: true,
  isTesting: false,
  port: 3000,
  schemas: null,
}

test('No config returns default config', () => {
  const initializedConfig = initConfig()

  expect(initializedConfig.resources).toEqual(defaultConfig.resources)
  expect(initializedConfig.validateResources).toBe(defaultConfig.validateResources)
  expect(initializedConfig.staticFolder).toBe(defaultConfig.staticFolder)
  expect(initializedConfig.apiPrefix).toBe(defaultConfig.apiPrefix)
  expect(initializedConfig.connectionString).toBe(defaultConfig.connectionString)
  expect(initializedConfig.cacheControl).toBe(defaultConfig.cacheControl)
  expect(initializedConfig.delay).toBe(defaultConfig.delay)
  expect(initializedConfig.requestBodyInterceptor?.post).toBe(
    defaultConfig.requestBodyInterceptor?.post,
  )
  expect(initializedConfig.requestBodyInterceptor?.patch).toBe(
    defaultConfig.requestBodyInterceptor?.patch,
  )
  expect(initializedConfig.requestBodyInterceptor?.put).toBe(
    defaultConfig.requestBodyInterceptor?.put,
  )
  expect(initializedConfig.responseBodyInterceptor).toBe(defaultConfig.responseBodyInterceptor)
  expect(initializedConfig.customRouter).toBe(defaultConfig.customRouter)
  expect(initializedConfig.returnNullFields).toBe(defaultConfig.returnNullFields)
  expect(initializedConfig.isTesting).toBe(defaultConfig.isTesting)
  expect(initializedConfig.port).toBe(defaultConfig.port)
  expect(initializedConfig.schemas).toBe(defaultConfig.schemas)
})

test('Full user config overrides all defaults', () => {
  const customRouter = express.Router()
  customRouter.get('/hello', async (_, res) => {
    return res.send('Hello, World!')
  })

  const config = initConfig({
    resources: ['movies'],
    staticFolder: 'build',
    apiPrefix: 'api',
    connectionString: 'mongodb://localhost:27017',
    cacheControl: 'no-cache',
    delay: 1000,
    requestBodyInterceptor: {
      post: () => {
        // do nothing
      },
      patch: () => {
        // do nothing
      },
      put: () => {
        // do nothing
      },
    },
    responseBodyInterceptor: ({ body }) => {
      return body
    },
    customRouter,
    returnNullFields: false,
    isTesting: true,
    port: 3001,
    schemas: {
      stuff: {
        post: {
          type: 'object',
        },
        put: {
          type: 'object',
        },
        patch: {
          type: 'object',
        },
      },
    },
  })

  expect(config.resources).toEqual(['movies'])
  expect(config.validateResources).toBe(true)
  expect(config.staticFolder).toBe('build')
  expect(config.apiPrefix).toBe('/api/')
  expect(config.connectionString).toBe('mongodb://localhost:27017')
  expect(config.cacheControl).toBe('no-cache')
  expect(config.delay).toBe(1000)
  expect(config.requestBodyInterceptor!.post).toBeInstanceOf(Function)
  expect(config.requestBodyInterceptor!.patch).toBeInstanceOf(Function)
  expect(config.requestBodyInterceptor!.put).toBeInstanceOf(Function)
  expect(config.responseBodyInterceptor).toBeInstanceOf(Function)
  expect(config.customRouter).not.toBeNull()
  expect(config.returnNullFields).toBe(false)
  expect(config.isTesting).toBe(true)
  expect(config.port).toBe(3001)
  expect(config.schemas).not.toBeNull()
})

test('Partial user config applies those, but leaves the rest at default', () => {
  const config = initConfig({
    apiPrefix: 'api',
  })

  expect(config.resources).toEqual(defaultConfig.resources)
  expect(config.validateResources).toBe(defaultConfig.validateResources)
  expect(config.staticFolder).toBe(defaultConfig.staticFolder)
  expect(config.apiPrefix).toBe('/api/')
  expect(config.connectionString).toBe(defaultConfig.connectionString)
  expect(config.cacheControl).toBe(defaultConfig.cacheControl)
  expect(config.delay).toBe(defaultConfig.delay)
  expect(config.requestBodyInterceptor?.post).toBe(defaultConfig.requestBodyInterceptor?.post)
  expect(config.requestBodyInterceptor?.patch).toBe(defaultConfig.requestBodyInterceptor?.patch)
  expect(config.requestBodyInterceptor?.put).toBe(defaultConfig.requestBodyInterceptor?.put)
  expect(config.responseBodyInterceptor).toBe(defaultConfig.responseBodyInterceptor)
  expect(config.customRouter).toBe(defaultConfig.customRouter)
  expect(config.returnNullFields).toBe(defaultConfig.returnNullFields)
  expect(config.isTesting).toBe(defaultConfig.isTesting)
  expect(config.port).toBe(defaultConfig.port)
  expect(config.schemas).toBe(defaultConfig.schemas)
})
