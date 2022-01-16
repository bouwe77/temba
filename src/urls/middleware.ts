import { Request, Response, NextFunction } from 'express'
import { TembaError } from '../errors/types'
import { parseUrl } from './urlParser'

function createResourceAndIdParser(apiPrefix) {
  return function getResourceAndId(
    req: Request,
    _: Response,
    next: NextFunction,
  ): void {
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
      const error = new TembaError(
        `'${resourceName}' is an unknown resource`,
        404,
      )
      return next(error)
    }

    return next()
  }
}

export { createResourceAndIdParser, createValidateResourceMiddleware }
