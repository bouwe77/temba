import { Response } from 'express'
import { parseUrl } from './urlParser'
import { ExtendedRequest } from '../routes/types'

function createResourceAndIdParser(apiPrefix: string) {
  return function getResourceAndId(req: ExtendedRequest, res: Response, next: () => void) {
    const url = req.baseUrl.replace(apiPrefix, '')
    const urlInfo = parseUrl(url)

    req.requestInfo = { ...req.requestInfo, ...urlInfo }

    return next()
  }
}

function createValidateResourceMiddleware(validateResources: boolean, resources: string[]) {
  return function validateResource(req: ExtendedRequest, res: Response, next: () => void) {
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
