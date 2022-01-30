import { new404NotFoundError } from '../errors/errors'
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
  return function validateResource(req, _, next) {
    if (!validateResources) return next()

    const { resourceName } = req.requestInfo

    if (!resourceName) return next()

    if (!resourceNames.includes(resourceName.toLowerCase())) {
      // TODO return a response instead of calling next
      const error = new404NotFoundError(
        `'${resourceName}' is an unknown resource`,
      )
      return next(error)
    }

    return next()
  }
}

export { createResourceAndIdParser, createValidateResourceMiddleware }
