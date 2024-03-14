import { type Response } from 'express'
import { parseUrl } from './urlParser'
import { type ExtendedRequest } from '../routes/types'

export const createResourceAndIdParser = (apiPrefix: string | null) => {
  const getResourceAndId = (req: ExtendedRequest, res: Response, next: () => void) => {
    const url = apiPrefix ? req.baseUrl.replace(apiPrefix, '') : req.baseUrl
    const urlInfo = parseUrl(url)

    req.requestInfo = { ...req.requestInfo, ...urlInfo }

    return next()
  }

  return getResourceAndId
}

export const createValidateResourceMiddleware = (
  validateResources: boolean,
  resources: string[],
) => {
  const validateResource = (req: ExtendedRequest, res: Response, next: () => void) => {
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

  return validateResource
}
