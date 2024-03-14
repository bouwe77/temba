import { type Response } from 'express'
import { parseUrl } from './urlParser'
import { type ExtendedRequest } from '../routes/types'

export function createResourceAndIdParser(apiPrefix: string | null) {
  return function getResourceAndId(req: ExtendedRequest, res: Response, next: () => void) {
    const url = apiPrefix ? req.baseUrl.replace(apiPrefix, '') : req.baseUrl
    const urlInfo = parseUrl(url)

    req.requestInfo = { ...req.requestInfo, ...urlInfo }

    return next()
  }
}

export function createValidateResourceMiddleware(validateResources: boolean, resources: string[]) {
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
