import { Router } from 'express'
import { RequestBodyInterceptor, ResponseBodyInterceptor } from '../routes/types'

export type Config = {
  validateResources: boolean
  resources: string[]
  apiPrefix: string
  cacheControl: string
  requestBodyInterceptor: RequestBodyInterceptor
  responseBodyInterceptor: ResponseBodyInterceptor
  staticFolder: string
  connectionString: string
  delay: number
  customRouter: Router
  returnNullFields: boolean
  isTesting: boolean
  port: number
  schemas: unknown
}

export type RouterConfig = Pick<
  Config,
  | 'validateResources'
  | 'resources'
  | 'apiPrefix'
  | 'cacheControl'
  | 'requestBodyInterceptor'
  | 'responseBodyInterceptor'
  | 'returnNullFields'
  | 'schemas'
>

export type UserConfig = {
  resources?: string[]
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  cacheControl?: string
  delay?: number
  requestBodyInterceptor?: RequestBodyInterceptor
  responseBodyInterceptor?: ResponseBodyInterceptor
  customRouter?: Router
  returnNullFields?: boolean
  isTesting?: boolean
  port?: number
  schemas?: unknown
}

const defaultConfig: Config = {
  resources: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: '',
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
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
  customRouter: null,
  returnNullFields: true,
  isTesting: false,
  port: 3000,
  schemas: null,
}

export function initConfig(userConfig: UserConfig): Config {
  if (!userConfig) return defaultConfig

  const config = { ...defaultConfig } as Config

  if (userConfig.resources && userConfig.resources.length > 0) {
    config.resources = userConfig.resources
    config.validateResources = true
  }

  if (userConfig.staticFolder) {
    config.staticFolder = userConfig.staticFolder.replace(/[^a-zA-Z0-9]/g, '')
  }

  if (userConfig.apiPrefix) {
    config.apiPrefix = '/' + userConfig.apiPrefix.replace(/[^a-zA-Z0-9]/g, '') + '/'
  }

  if (userConfig.connectionString && userConfig.connectionString.length > 0) {
    config.connectionString = userConfig.connectionString
  }

  if (userConfig.cacheControl && userConfig.cacheControl.length > 0) {
    config.cacheControl = userConfig.cacheControl
  }

  if (
    userConfig.delay &&
    userConfig.delay !== 0 &&
    typeof Number(userConfig.delay) === 'number' &&
    Number(userConfig.delay) > 0 &&
    Number(userConfig.delay) < 10000
  ) {
    config.delay = Number(userConfig.delay)
  }

  if (userConfig.requestBodyInterceptor) {
    if (
      userConfig.requestBodyInterceptor.post &&
      typeof userConfig.requestBodyInterceptor.post === 'function'
    ) {
      config.requestBodyInterceptor.post = userConfig.requestBodyInterceptor.post
    }
    if (
      userConfig.requestBodyInterceptor.patch &&
      typeof userConfig.requestBodyInterceptor.patch === 'function'
    ) {
      config.requestBodyInterceptor.patch = userConfig.requestBodyInterceptor.patch
    }
    if (
      userConfig.requestBodyInterceptor.put &&
      typeof userConfig.requestBodyInterceptor.put === 'function'
    ) {
      config.requestBodyInterceptor.put = userConfig.requestBodyInterceptor.put
    }
  }

  if (userConfig.responseBodyInterceptor) {
    config.responseBodyInterceptor = userConfig.responseBodyInterceptor
  }

  if (userConfig.customRouter) {
    config.customRouter = userConfig.customRouter
  }

  // TODO hier gebruik ik duplicate default values, dus if er omheen
  config.returnNullFields = userConfig.returnNullFields ?? true
  config.isTesting = userConfig.isTesting ?? false
  config.port = userConfig.port ?? 3000

  if (userConfig.schemas) {
    config.schemas = userConfig.schemas
  }

  return config
}
