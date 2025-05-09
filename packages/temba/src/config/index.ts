import type { ConfiguredSchemas } from '../schema/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { Implementations } from '../implementations'

type ResourcePath = string

type ExtendedResource = {
  resourcePath: ResourcePath
  singularName: string
  pluralName: string
}

type Resources = (ResourcePath | ExtendedResource)[]

type OpenApiConfig = boolean | Record<string, unknown>

export type Config = {
  validateResources: boolean
  resources: Resources
  apiPrefix: string | null
  requestInterceptor: RequestInterceptor | null
  responseBodyInterceptor: ResponseBodyInterceptor | null
  staticFolder: string | null
  connectionString: string | null
  delay: number
  returnNullFields: boolean
  port: number
  schemas: ConfiguredSchemas | null
  allowDeleteCollection: boolean
  etagsEnabled: boolean
  openapi: OpenApiConfig

  isTesting: boolean
  implementations: Implementations | null
}

export type ConfigKey = keyof Config

export type UserConfig = {
  resources?: Resources
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  delay?: number
  requestInterceptor?: RequestInterceptor
  responseBodyInterceptor?: ResponseBodyInterceptor
  returnNullFields?: boolean
  port?: number
  schemas?: ConfiguredSchemas
  allowDeleteCollection?: boolean
  etags?: boolean
  openapi?: OpenApiConfig

  // Use isTesting when running tests that don't require a started server.
  isTesting?: boolean
  // Override implementation in when testing.
  implementations?: Implementations
}

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
  port: 3000,
  schemas: null,
  allowDeleteCollection: false,
  etagsEnabled: false,
  openapi: true,

  isTesting: false,
  implementations: null,
}

export const initConfig = (userConfig?: UserConfig): Config => {
  if (!userConfig) return defaultConfig

  const config = { ...defaultConfig } as Config

  if (userConfig.resources && userConfig.resources.length > 0) {
    config.resources = userConfig.resources
    config.validateResources = true
  }

  if (userConfig.staticFolder) {
    //TODO define/what happens when the replace results in an empty string
    const staticFolder = userConfig.staticFolder.replace(/[^a-zA-Z0-9]/g, '')
    if (staticFolder.length > 0) {
      config.staticFolder = staticFolder
      // To make a clear distinction between static files and API routes
      config.apiPrefix = 'api'
    }
  }

  if (userConfig.apiPrefix) {
    //TODO define/what happens when the replace results in an empty string
    config.apiPrefix = userConfig.apiPrefix.replace(/[^a-zA-Z0-9]/g, '')
  }

  if (userConfig.connectionString && userConfig.connectionString.length > 0) {
    config.connectionString = userConfig.connectionString
  }

  if (
    userConfig.delay &&
    userConfig.delay !== 0 &&
    typeof Number(userConfig.delay) === 'number' &&
    Number(userConfig.delay) > 0 &&
    Number(userConfig.delay) < 100000
  ) {
    config.delay = userConfig.delay
  }

  if (userConfig.requestInterceptor) {
    config.requestInterceptor = config.requestInterceptor || {}

    if (
      userConfig.requestInterceptor.get &&
      typeof userConfig.requestInterceptor.get === 'function'
    ) {
      config.requestInterceptor.get = userConfig.requestInterceptor.get
    }
    if (
      userConfig.requestInterceptor.post &&
      typeof userConfig.requestInterceptor.post === 'function'
    ) {
      config.requestInterceptor.post = userConfig.requestInterceptor.post
    }
    if (
      userConfig.requestInterceptor.patch &&
      typeof userConfig.requestInterceptor.patch === 'function'
    ) {
      config.requestInterceptor.patch = userConfig.requestInterceptor.patch
    }
    if (
      userConfig.requestInterceptor.put &&
      typeof userConfig.requestInterceptor.put === 'function'
    ) {
      config.requestInterceptor.put = userConfig.requestInterceptor.put
    }
    if (
      userConfig.requestInterceptor.delete &&
      typeof userConfig.requestInterceptor.delete === 'function'
    ) {
      config.requestInterceptor.delete = userConfig.requestInterceptor.delete
    }
  }

  if (userConfig.responseBodyInterceptor) {
    config.responseBodyInterceptor = userConfig.responseBodyInterceptor
  }

  if (!isUndefined(userConfig.returnNullFields)) {
    config.returnNullFields = userConfig.returnNullFields
  }

  if (!isUndefined(userConfig.isTesting)) {
    config.isTesting = userConfig.isTesting
    config.implementations = userConfig.implementations || null
  }

  if (!isUndefined(userConfig.port)) {
    config.port = userConfig.port
  }

  if (userConfig.schemas) {
    config.schemas = userConfig.schemas
  }

  if (!isUndefined(userConfig.allowDeleteCollection)) {
    config.allowDeleteCollection = userConfig.allowDeleteCollection
  }

  if (!isUndefined(userConfig.etags)) {
    config.etagsEnabled = userConfig.etags
  }

  if (!isUndefined(userConfig.openapi)) {
    config.openapi = userConfig.openapi
  }

  return config
}

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined'
