import type { Implementations } from '../implementations'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { ConfiguredSchemas } from '../schema/types'

type ResourcePath = string

type ExtendedResource = {
  resourcePath: ResourcePath
  singularName: string
  pluralName: string
}

type Resources = (ResourcePath | ExtendedResource)[]

type OpenApiConfig = boolean | Record<string, unknown>

export type CorsConfig = {
  origin: string
  methods: string
  headers: string
  credentials: boolean
  exposeHeaders: string | null
  maxAge: number | null
}

export type UserCorsConfig = {
  origin?: string
  methods?: string
  headers?: string
  credentials?: boolean
  exposeHeaders?: string
  maxAge?: number
}

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
  webSocket: boolean
  cors: CorsConfig

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
  webSocket?: boolean
  cors?: UserCorsConfig

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
  port: 8362,
  schemas: null,
  allowDeleteCollection: false,
  etagsEnabled: false,
  openapi: true,
  webSocket: false,
  cors: {
    origin: '*',
    methods: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
    headers: 'Content-Type, X-Token',
    credentials: false,
    exposeHeaders: null,
    maxAge: null,
  },

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
    const staticFolder = userConfig.staticFolder.replace(/[^a-zA-Z0-9]/g, '')
    if (staticFolder.length > 0) {
      config.staticFolder = staticFolder
      // To make a clear distinction between static files and API routes
      config.apiPrefix = 'api'
    }
  }

  if (userConfig.apiPrefix) {
    const cleanPrefix = userConfig.apiPrefix.replace(/[^a-zA-Z0-9]/g, '')
    // Only apply if the result is a valid string.
    // This prevents overwriting the 'api' default if the user input was invalid.
    if (cleanPrefix.length > 0) {
      config.apiPrefix = cleanPrefix
    }
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

  if (!isUndefined(userConfig.webSocket)) {
    config.webSocket = userConfig.webSocket
  }

  if (userConfig.cors) {
    config.cors = { ...config.cors, ...userConfig.cors }
  }

  return config
}

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined'
