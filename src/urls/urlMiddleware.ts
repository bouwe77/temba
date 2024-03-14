import { type Response } from 'express'
import { parseUrl } from './urlParser'
import { type ExtendedRequest } from '../routes/types'

export const createUrlMiddleware = (
  apiPrefix: string | null,
  validateResources: boolean,
  resources: string[],
) => {
  const urlMiddleware = (req: ExtendedRequest, res: Response, next: () => void) => {
    const url = apiPrefix ? req.baseUrl.replace(apiPrefix, '') : req.baseUrl
    const urlInfo = parseUrl(url)

    if (!urlInfo.resource) return next()

    req.requestInfo = {
      resource: urlInfo.resource,
      id: urlInfo.id,
    }

    if (!validateResources) return next()

    const { resource } = req.requestInfo

    if (!resources.includes(urlInfo.resource.toLowerCase())) {
      return res.status(404).json({
        message: `'${resource}' is an unknown resource`,
      })
    }

    return next()
  }

  return urlMiddleware
}
