function initConfig(config) {
  if (!config) config = {}
  if (!config.resourceNames || config.resourceNames.length === 0)
    config.resourceNames = ['articles']
}

export default { initConfig }
