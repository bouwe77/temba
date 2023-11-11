import { initConfig } from '../../../src/config'
import type { Config, ConfigKey } from '../../../src/config'
import express from 'express'

const assertDefaultConfig = (config: Config, skip?: ConfigKey[]) => {
  if (!skip) skip = []

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

  // Do not check keys that are just containers for other keys.
  const alwaysSkip = ['requestBodyInterceptor']

  // Some settings are callback functions
  const callbackKeys = ['responseBodyInterceptor', 'post', 'patch', 'put']

  for (const key in defaultConfig) {
    if (alwaysSkip.includes(key)) continue
    if (skip.includes(key as ConfigKey)) continue

    // For callback functions we just wanna know they are functions,
    // because the actual implementation is tested elsewhere.
    // if (callbackKeys.includes(key)) {
    //   expect(config[key]).toBeInstanceOf(Function)
    //   continue
    // }

    // All other keys should be equal to the default config.
    expect(config[key]).toEqual(defaultConfig[key])
  }
}

test('No config returns default config', () => {
  const defaultConfig = initConfig()
  assertDefaultConfig(defaultConfig)
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
  expect(config.requestBodyInterceptor.post).toBeInstanceOf(Function)
  expect(config.requestBodyInterceptor.patch).toBeInstanceOf(Function)
  expect(config.requestBodyInterceptor.put).toBeInstanceOf(Function)
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

  expect(config.apiPrefix).toBe('/api/')
  assertDefaultConfig(config, ['apiPrefix'])
})
