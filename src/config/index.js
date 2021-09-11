import { logLevels } from '../logging'

export function initConfig(config) {
  if (!config) config = {}

  if (!config.resourceNames || config.resourceNames.length === 0)
    config.resourceNames = ['articles']

  if (
    typeof config.validateResources === 'undefined' ||
    config.validateResources === null
  ) {
    config.validateResources = true
  } else config.validateResources = !!config.validateResources

  if (
    !config.logLevel ||
    config.logLevel.length === 0 ||
    !Object.keys(logLevels).includes(config.logLevel.toUpperCase())
  ) {
    config.logLevel = logLevels.INFO
  } else config.logLevel = config.logLevel.toUpperCase()

  if (config.staticFolder) {
    config.staticFolder = config.staticFolder.replace(/[^a-zA-Z0-9]/g, '')
  } else config.staticFolder = null

  if (config.apiPrefix) {
    config.apiPrefix = '/' + config.apiPrefix.replace(/[^a-zA-Z0-9]/g, '') + '/'
  } else config.apiPrefix = ''

  return config
}
