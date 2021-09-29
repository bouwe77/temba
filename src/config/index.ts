import { TembaConfig } from './types'

const defaultConfig: TembaConfig = {
  resourceNames: [],
  validateResources: false,
  staticFolder: null,
  apiPrefix: '',
  connectionString: null,
  cacheControl: 'no-store',
  delay: 0,
}

export function initConfig(userConfig: TembaConfig): TembaConfig {
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
    typeof Number(userConfig.delay) === 'number' &&
    Number(userConfig.delay) > 0 &&
    Number(userConfig.delay) < 10000
  ) {
    config.delay = Number(userConfig.delay)
  }

  return config
}
