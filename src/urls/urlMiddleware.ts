import { parseUrl } from './urlParser'

function createResourceAndIdParser(apiPrefix) {
  return function getResourceAndId(req, _, next) {
    const url = req.baseUrl.replace(apiPrefix, '')
    const urlInfo = parseUrl(url)

    req.requestInfo = { ...req.requestInfo, ...urlInfo }

    return next()
  }
}

function createValidateResourceMiddleware(validateResources, resourceNames) {
  return function validateResource(req, res, next) {
    if (!validateResources) return next()

    const { resourceName } = req.requestInfo

    if (!resourceName) return next()

    if (!resourceNames.includes(resourceName.toLowerCase())) {
      return res.status(404).json({
        message: `'${resourceName}' is an unknown resource`,
      })
    }

    return next()
  }
}

export { createResourceAndIdParser, createValidateResourceMiddleware }
