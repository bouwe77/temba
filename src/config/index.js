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

  return config
}
