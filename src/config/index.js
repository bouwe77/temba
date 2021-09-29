import { logLevels } from '../logging'

const defaultConfig = {
  resourceNames: [],
  validateResources: false,
  logLevel: logLevels.DEBUG,
  staticFolder: null,
  apiPrefix: '',
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
}

export function initConfig(userConfig) {
  if (!userConfig) return defaultConfig

  const config = { ...defaultConfig }

  if (userConfig.resourceNames && userConfig.resourceNames.length > 0) {
    config.resourceNames = userConfig.resourceNames
    config.validateResources = true
  }

  if (
    userConfig.logLevel &&
    userConfig.logLevel.length !== 0 &&
    Object.keys(logLevels).includes(userConfig.logLevel.toUpperCase())
  ) {
    config.logLevel = userConfig.logLevel.toUpperCase()
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
    userConfig.delay.length !== 0 &&
    typeof Number(userConfig.delay) === 'number' &&
    Number(userConfig.delay) > 0 &&
    Number(userConfig.delay) < 10000
  ) {
    config.delay = Number(userConfig.delay)
  }

  return config
}
