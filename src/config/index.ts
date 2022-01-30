import { RequestBodyValidator } from '../routes/types'

export type Config = {
  resourceNames?: string[]
  validateResources?: boolean
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  cacheControl?: string
  delay?: number
  requestBodyValidator?: RequestBodyValidator
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
    put: () => {
      // do nothing
    },
  },
}

export function initConfig(userConfig: Config): Config {
  if (!userConfig) return defaultConfig

  const config = { ...defaultConfig }

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
      userConfig.requestBodyValidator.put &&
      typeof userConfig.requestBodyValidator.put === 'function'
    ) {
      config.requestBodyValidator.put = userConfig.requestBodyValidator.put
    }
  }

  return config
}
