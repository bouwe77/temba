import type { Implementations } from '../implementations'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { ConfiguredSchemas } from '../schema/types'

type ResourcePath = string

export type DataSourceConfig =
  /** In-memory storage — data is lost on restart */
  | { type: 'memory' }
  /** Single JSON file on disk — all resources stored in one file */
  | { type: 'file'; filename: string }
  /** Folder of JSON files on disk — one file per resource */
  | { type: 'folder'; folder: string }
  /** MongoDB database */
  | {
      type: 'mongodb'
      uri: string
      /** Username for authentication (alternative to embedding in URI) */
      username?: string
      /** Password for authentication (alternative to embedding in URI) */
      password?: string
      /** Authentication database, defaults to 'admin' */
      authSource?: string
      /** Enable TLS/SSL */
      tls?: boolean
      /** Path to the CA certificate file */
      tlsCAFile?: string
      /** Path to the client certificate/key file */
      tlsCertificateKeyFile?: string
      /** Allow invalid TLS certificates (not recommended for production) */
      tlsAllowInvalidCertificates?: boolean
      /** Maximum number of connections in the connection pool */
      maxPoolSize?: number
      /** Minimum number of connections in the connection pool */
      minPoolSize?: number
      /** Timeout (ms) for server selection */
      serverSelectionTimeoutMS?: number
      /** Timeout (ms) for initial connection */
      connectTimeoutMS?: number
      /** Replica set name */
      replicaSet?: string
      /** Read preference (e.g. 'primary', 'secondary', 'nearest') */
      readPreference?: string
      /** Write concern (e.g. 'majority') */
      writeConcern?: string
    }

type ExtendedResource = {
  resourcePath: ResourcePath
  singularName: string
  pluralName: string
}

type Resources = (ResourcePath | ExtendedResource)[]

type OpenApiConfig = boolean | Record<string, unknown>

/** @internal */
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

/** @internal */
export type Config = {
  validateResources: boolean
  resources: Resources
  apiPrefix: string | null
  requestInterceptor: RequestInterceptor | null
  responseBodyInterceptor: ResponseBodyInterceptor | null
  staticFolder: string | null
  connectionString: string | DataSourceConfig | null
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

/** @internal */
export type ConfigKey = keyof Config

export type UserConfig = {
  resources?: Resources
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string | DataSourceConfig
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
  if (userConfig.connectionString !== undefined && userConfig.connectionString !== '') {
    config.connectionString = userConfig.connectionString
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
