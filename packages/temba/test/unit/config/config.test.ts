import { expect, test } from 'vitest'
import type { Config } from '../../../src/config'
import { initConfig } from '../../../src/config'

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
  port: 8362,
  schemas: null,
  allowDeleteCollection: false,
  etagsEnabled: false,
  openapi: true,
  webSocket: false,

  isTesting: false,
  implementations: null,
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
  expect(initializedConfig.port).toBe(defaultConfig.port)
  expect(initializedConfig.schemas).toBe(defaultConfig.schemas)
  expect(initializedConfig.allowDeleteCollection).toBe(defaultConfig.allowDeleteCollection)
  expect(initializedConfig.etagsEnabled).toBe(defaultConfig.etagsEnabled)
  expect(initializedConfig.openapi).toBe(defaultConfig.openapi)
  expect(initializedConfig.webSocket).toBe(defaultConfig.webSocket)
  expect(initializedConfig.isTesting).toBe(defaultConfig.isTesting)
  expect(initializedConfig.implementations).toBe(defaultConfig.implementations)
})

test('Full user config overrides all defaults', () => {
  const config = initConfig({
    resources: ['movies'],
    staticFolder: 'build',
    apiPrefix: 'stuff',
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
    webSocket: true,
    isTesting: true,
    implementations: {
      getStaticFileFromDisk: () =>
        Promise.resolve({ content: 'Hello, World!', mimeType: 'text/plain' }),
    },
  })

  expect(config.resources).toEqual(['movies'])
  expect(config.validateResources).toBe(true)
  expect(config.staticFolder).toBe('build')
  expect(config.apiPrefix).toBe('stuff')
  expect(config.connectionString).toBe('mongodb://localhost:27017')
  expect(config.delay).toBe(1000)
  expect(config.requestInterceptor!.get).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.post).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.patch).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.put).toBeInstanceOf(Function)
  expect(config.requestInterceptor!.delete).toBeInstanceOf(Function)
  expect(config.responseBodyInterceptor).toBeInstanceOf(Function)
  expect(config.returnNullFields).toBe(false)
  expect(config.port).toBe(3001)
  expect(config.schemas).not.toBeNull()
  expect(config.allowDeleteCollection).toBe(true)
  expect(config.etagsEnabled).toBe(true)
  expect(config.openapi).toBe(true)
  expect(config.webSocket).toBe(true)

  expect(config.isTesting).toBe(true)
  expect(config.implementations).not.toBeNull()
  expect(config.implementations!.getStaticFileFromDisk).toBeInstanceOf(Function)
})

test('Partial user config applies those, but leaves the rest at default', () => {
  const config = initConfig({
    port: 4321,
  })

  expect(config.port).toBe(4321)

  expect(config.resources).toEqual(defaultConfig.resources)
  expect(config.validateResources).toBe(defaultConfig.validateResources)
  expect(config.staticFolder).toBe(defaultConfig.staticFolder)
  expect(config.apiPrefix).toBe(defaultConfig.apiPrefix)
  expect(config.connectionString).toBe(defaultConfig.connectionString)
  expect(config.delay).toBe(defaultConfig.delay)
  expect(config.requestInterceptor?.get).toBe(defaultConfig.requestInterceptor?.get)
  expect(config.requestInterceptor?.post).toBe(defaultConfig.requestInterceptor?.post)
  expect(config.requestInterceptor?.patch).toBe(defaultConfig.requestInterceptor?.patch)
  expect(config.requestInterceptor?.put).toBe(defaultConfig.requestInterceptor?.put)
  expect(config.requestInterceptor?.delete).toBe(defaultConfig.requestInterceptor?.delete)
  expect(config.responseBodyInterceptor).toBe(defaultConfig.responseBodyInterceptor)
  expect(config.returnNullFields).toBe(defaultConfig.returnNullFields)
  expect(config.schemas).toBe(defaultConfig.schemas)
  expect(config.allowDeleteCollection).toBe(defaultConfig.allowDeleteCollection)
  expect(config.etagsEnabled).toBe(defaultConfig.etagsEnabled)
  expect(config.openapi).toBe(defaultConfig.openapi)
  expect(config.webSocket).toBe(defaultConfig.webSocket)
  expect(config.isTesting).toBe(defaultConfig.isTesting)
  expect(config.implementations).toBe(defaultConfig.implementations)
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

test("Configuring staticFolder sets apiPrefix to 'api'", () => {
  const config = initConfig({
    staticFolder: 'dist',
  })

  expect(config.staticFolder).toBe('dist')
  expect(config.apiPrefix).toBe('api')
})

test("An empty apiPrefix defaults to 'api' when staticFolder is set", () => {
  const config = initConfig({
    staticFolder: 'dist',
    apiPrefix: '',
  })

  expect(config.apiPrefix).toBe('api')
})

test('apiPrefix with only special characters is ignored (remains null)', () => {
  const config = initConfig({
    // This resolves to "" and should be ignored
    apiPrefix: '/_/',
  })

  // It remains the default (null) instead of becoming ""
  expect(config.apiPrefix).toBeNull()
})

test('staticFolder with only special characters is ignored', () => {
  const config = initConfig({
    // This resolves to "" and should be ignored
    staticFolder: './_/',
  })

  expect(config.staticFolder).toBeNull()
  // Since staticFolder was ignored, it never triggered the "api" default
  expect(config.apiPrefix).toBeNull()
})

test('Invalid apiPrefix does NOT overwrite the default "api" set by staticFolder', () => {
  const config = initConfig({
    staticFolder: 'public', // Sets apiPrefix to 'api'
    apiPrefix: '/_/', // Invalid input
  })

  expect(config.staticFolder).toBe('public')
  // The invalid input is ignored, preserving the 'api' default
  expect(config.apiPrefix).toBe('api')
})

test('Valid apiPrefix correctly overrides the "api" default', () => {
  const config = initConfig({
    staticFolder: 'public', // Sets apiPrefix to 'api'
    apiPrefix: 'v1', // Valid input
  })

  expect(config.staticFolder).toBe('public')
  // The valid input overwrites 'api'
  expect(config.apiPrefix).toBe('v1')
})
