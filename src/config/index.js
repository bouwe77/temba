import { logLevels } from '../logging'

const defaultConfig = {
  resourceNames: ['articles'],
  validateResources: true,
  logLevel: logLevels.DEBUG,
  staticFolder: null,
  apiPrefix: '',
}

export function initConfig(userConfig) {
  if (!userConfig) returndefaultConfig

  const config = { ...defaultConfig }

  if (userConfig.resourceNames && userConfig.resourceNames.length > 0) {
    config.resourceNames = userConfig.resourceNames
  }
  if (
    typeof userConfig.validateResources !== 'undefined' &&
    userConfig.validateResources !== null
  ) {
    config.validateResources = !!userConfig.validateResources
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
    userConfig.apiPrefix =
      '/' + userConfig.apiPrefix.replace(/[^a-zA-Z0-9]/g, '') + '/'
  }

  return config
}
