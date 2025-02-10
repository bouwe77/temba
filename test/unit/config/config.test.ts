import { test, expect } from 'vitest'
import { initConfig } from '../../../src/config'
import type { Config } from '../../../src/config'

const defaultConfig: Config = {
  resources: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: null,
  connectionString: null,
  delay: 0,
  requestInterceptor: null,
  responseBodyInterceptor: null,
  returnNullFields: true,
  isTesting: false,
  port: 3000,
  schemas: null,
  allowDeleteCollection: false,
  etags: false,
  openapi: false,
}

test('No config returns default config', () => {
  const initializedConfig = initConfig()

  expect(initializedConfig.resources).toEqual(defaultConfig.resources)
  expect(initializedConfig.validateResources).toBe(defaultConfig.validateResources)
  expect(initializedConfig.staticFolder).toBe(defaultConfig.staticFolder)
  expect(initializedConfig.apiPrefix).toBe(defaultConfig.apiPrefix)
  expect(initializedConfig.connectionString).toBe(defaultConfig.connectionString)
  expect(initializedConfig.delay).toBe(defaultConfig.delay)
  expect(initializedConfig.requestInterceptor?.get).toBe(defaultConfig.requestInterceptor?.get)
  expect(initializedConfig.requestInterceptor?.post).toBe(defaultConfig.requestInterceptor?.post)
  expect(initializedConfig.requestInterceptor?.patch).toBe(defaultConfig.requestInterceptor?.patch)
  expect(initializedConfig.requestInterceptor?.put).toBe(defaultConfig.requestInterceptor?.put)
  expect(initializedConfig.requestInterceptor?.delete).toBe(
    defaultConfig.requestInterceptor?.delete,
  )
  expect(initializedConfig.responseBodyInterceptor).toBe(defaultConfig.responseBodyInterceptor)
  expect(initializedConfig.returnNullFields).toBe(defaultConfig.returnNullFields)
  expect(initializedConfig.isTesting).toBe(defaultConfig.isTesting)
  expect(initializedConfig.port).toBe(defaultConfig.port)
  expect(initializedConfig.schemas).toBe(defaultConfig.schemas)
  expect(initializedConfig.allowDeleteCollection).toBe(defaultConfig.allowDeleteCollection)
  expect(initializedConfig.etags).toBe(defaultConfig.etags)
  expect(initializedConfig.openapi).toBe(defaultConfig.openapi)
})

test('Full user config overrides all defaults', () => {
  const config = initConfig({
    resources: ['movies'],
    staticFolder: 'build',
    apiPrefix: 'api',
    connectionString: 'mongodb://localhost:27017',
    delay: 1000,
    requestInterceptor: {
      get: () => {
        // do nothing
      },
      post: () => {
        // do nothing
      },
      patch: () => {
        // do nothing
      },
      put: () => {
        // do nothing
      },
      delete: () => {
        // do nothing
      },
    },
    responseBodyInterceptor: ({ body }) => {
      return body
    },
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
    allowDeleteCollection: true,
    etags: true,
    openapi: true,
  })

  expect(config.resources).toEqual(['movies'])
  expect(config.validateResources).toBe(true)
  expect(config.staticFolder).toBe('build')
  expect(config.apiPrefix).toBe('/api/')
  expect(config.connectionString).toBe('mongodb://localhost:27017')
  expect(config.delay).toBe(1000)
  expect(config.requestInterceptor!.get).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.post).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.patch).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.put).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.delete).toBeInstanceOf(Function)
  expect(config.responseBodyInterceptor).toBeInstanceOf(Function)
  expect(config.returnNullFields).toBe(false)
  expect(config.isTesting).toBe(true)
  expect(config.port).toBe(3001)
  expect(config.schemas).not.toBeNull()
  expect(config.allowDeleteCollection).toBe(true)
  expect(config.etags).toBe(true)
  expect(config.openapi).toBe(true)
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
  expect(config.delay).toBe(defaultConfig.delay)
  expect(config.requestInterceptor?.get).toBe(defaultConfig.requestInterceptor?.get)
  expect(config.requestInterceptor?.post).toBe(defaultConfig.requestInterceptor?.post)
  expect(config.requestInterceptor?.patch).toBe(defaultConfig.requestInterceptor?.patch)
  expect(config.requestInterceptor?.put).toBe(defaultConfig.requestInterceptor?.put)
  expect(config.requestInterceptor?.delete).toBe(defaultConfig.requestInterceptor?.delete)
  expect(config.responseBodyInterceptor).toBe(defaultConfig.responseBodyInterceptor)
  expect(config.returnNullFields).toBe(defaultConfig.returnNullFields)
  expect(config.isTesting).toBe(defaultConfig.isTesting)
  expect(config.port).toBe(defaultConfig.port)
  expect(config.schemas).toBe(defaultConfig.schemas)
  expect(config.allowDeleteCollection).toBe(defaultConfig.allowDeleteCollection)
  expect(config.etags).toBe(defaultConfig.etags)
  expect(config.openapi).toBe(defaultConfig.openapi)
})

test('Configuring multiple resources, both strings and extended ones', () => {
  const config = initConfig({
    resources: [
      'movies',
      {
        resourcePath: 'people',
        singularName: 'person',
        pluralName: 'people',
      },
    ],
  })

  expect(config.resources.length).toEqual(2)
  expect(config.resources[0]).toEqual('movies')
  expect(config.resources[1]).toEqual({
    resourcePath: 'people',
    singularName: 'person',
    pluralName: 'people',
  })
})

test('Configuring openapi as an object', () => {
  const config = initConfig({
    openapi: {
      info: {
        title: 'My custom API title',
      },
    },
  })

  expect(config.openapi).toEqual({
    info: {
      title: 'My custom API title',
    },
  })
})
