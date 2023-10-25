import { parseUrl } from './urlParser'

function createResourceAndIdParser(apiPrefix) {
  return function getResourceAndId(req, _, next) {
    const url = req.baseUrl.replace(apiPrefix, '')
    const urlInfo = parseUrl(url)

    req.requestInfo = { ...req.requestInfo, ...urlInfo }

    return next()
  }
}

function createValidateResourceMiddleware(validateResources, resources) {
  return function validateResource(req, res, next) {
    if (!validateResources) return next()

    const { resource } = req.requestInfo

    if (!resource) return next()

    if (!resources.includes(resource.toLowerCase())) {
      return res.status(404).json({
        message: `'${resource}' is an unknown resource`,
      })
    }

    return next()
  }
}

export { createResourceAndIdParser, createValidateResourceMiddleware }
