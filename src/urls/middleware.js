import { parseUrl } from './urlParser'

function getResourceAndId(req, _, next) {
  let urlInfo = parseUrl(req.url)

  req.requestInfo = { ...req.requestInfo, ...urlInfo }

  return next()
}

function createValidateResourceMiddleware(validateResources, resourceNames) {
  return function validateResource(req, _, next) {
    if (!validateResources) return next()

    const { resourceName } = req.requestInfo

    if (!resourceName) return next()

    if (!resourceNames.includes(resourceName.toLowerCase())) {
      const error = new Error(`'${resourceName}' is an unknown resource`)
      error.status = 404
      console.log('validateResource: ' + error.message)
      return next(error)
    }

    return next()
  }
}

export { getResourceAndId, createValidateResourceMiddleware }
