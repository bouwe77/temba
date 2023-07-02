import { Router } from 'express'
import { RequestBodyValidator } from '../routes/types'

export type Config =  {
  validateResources: boolean
  resourceNames: string[]
  apiPrefix: string
  cacheControl: string
  requestBodyValidator: RequestBodyValidator
  staticFolder: string
  connectionString: string
  delay: number
  customRouter: Router
}

export type RouterConfig = Pick<Config, 
  'validateResources' | 
  'resourceNames' |
  'apiPrefix' |
  'cacheControl' |
  'requestBodyValidator'
>;

export type UserConfig = {
  resourceNames?: string[]
  validateResources?: boolean
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  cacheControl?: string
  delay?: number
  requestBodyValidator?: RequestBodyValidator
  customRouter?: Router
}

const defaultConfig: Config = {
  resourceNames: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: '',
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
  requestBodyValidator: {
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
  customRouter: null,
}

export function initConfig(userConfig: UserConfig): Config {
  if (!userConfig) return defaultConfig

  const config = { ...defaultConfig } as Config

  if (userConfig.resourceNames && userConfig.resourceNames.length > 0) {
    config.resourceNames = userConfig.resourceNames
    config.validateResources = true
  }

  if (userConfig.staticFolder) {
    config.staticFolder = userConfig.staticFolder.replace(/[^a-zA-Z0-9]/g, '')
  }

  if (userConfig.apiPrefix) {
    config.apiPrefix =
      '/' + userConfig.apiPrefix.replace(/[^a-zA-Z0-9]/g, '') + '/'
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

  if (userConfig.requestBodyValidator) {
    if (
      userConfig.requestBodyValidator.post &&
      typeof userConfig.requestBodyValidator.post === 'function'
    ) {
      config.requestBodyValidator.post = userConfig.requestBodyValidator.post
    }
    if (
      userConfig.requestBodyValidator.patch &&
      typeof userConfig.requestBodyValidator.patch === 'function'
    ) {
      config.requestBodyValidator.patch = userConfig.requestBodyValidator.patch
    }
    if (
      userConfig.requestBodyValidator.put &&
      typeof userConfig.requestBodyValidator.put === 'function'
    ) {
      config.requestBodyValidator.put = userConfig.requestBodyValidator.put
    }
  }

  if (userConfig.customRouter) {
    config.customRouter = userConfig.customRouter
  }

  return config
}
