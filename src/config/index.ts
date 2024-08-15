import { Router } from 'express'
import type { ConfiguredSchemas } from '../schema/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'

export type Config = {
  validateResources: boolean
  resources: string[]
  apiPrefix: string | null
  cacheControl: string
  requestInterceptor: RequestInterceptor | null
  responseBodyInterceptor: ResponseBodyInterceptor | null
  staticFolder: string | null
  connectionString: string | null
  delay: number
  customRouter: Router | null
  returnNullFields: boolean
  isTesting: boolean
  port: number
  schemas: ConfiguredSchemas | null
  allowDeleteCollection: boolean
  etags: boolean
}

export type ConfigKey = keyof Config

export type RouterConfig = Pick<
  Config,
  | 'validateResources'
  | 'resources'
  | 'apiPrefix'
  | 'cacheControl'
  | 'requestInterceptor'
  | 'responseBodyInterceptor'
  | 'returnNullFields'
  | 'allowDeleteCollection'
  | 'etags'
>

export type UserConfig = {
  resources?: string[]
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  cacheControl?: string
  delay?: number
  requestInterceptor?: RequestInterceptor
  responseBodyInterceptor?: ResponseBodyInterceptor
  customRouter?: Router
  returnNullFields?: boolean
  isTesting?: boolean
  port?: number
  schemas?: ConfiguredSchemas
  allowDeleteCollection?: boolean
  etags?: boolean
}

const defaultConfig: Config = {
  resources: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: null,
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
  requestInterceptor: null,
  responseBodyInterceptor: null,
  customRouter: null,
  returnNullFields: true,
  isTesting: false,
  port: 3000,
  schemas: null,
  allowDeleteCollection: false,
  etags: false,
}

export const initConfig = (userConfig?: UserConfig): Config => {
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

  if (userConfig.customRouter) {
    config.customRouter = userConfig.customRouter
  }

  if (!isUndefined(userConfig.returnNullFields)) {
    config.returnNullFields = userConfig.returnNullFields
  }

  if (!isUndefined(userConfig.isTesting)) {
    config.isTesting = userConfig.isTesting
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
    config.etags = userConfig.etags
  }

  return config
}

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined'
