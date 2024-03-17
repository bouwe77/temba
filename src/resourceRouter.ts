import express from 'express'
import type { Response, Request } from 'express'
import { getRequestHandler } from './requestHandlers'
import { parseUrl } from './urls/urlParser'
import type { TembaRequest, TembaResponse } from './requestHandlers/types'
import type { Queries } from './queries/types'
import type { CompiledSchemas } from './schema/types'
import type { RouterConfig } from './config'

export const createResourceRouter = (
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) => {
  const getUrlInfo = (baseUrl: string) => {
    const url = routerConfig.apiPrefix ? baseUrl.replace(routerConfig.apiPrefix, '') : baseUrl
    return parseUrl(url)
  }

  const parseGetRequest = (req: express.Request) => {
    const urlInfo = getUrlInfo(req.baseUrl)
    if (!urlInfo.resource) return null

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
    }
  }

  const parsePostRequest = (req: express.Request) => {
    const urlInfo = getUrlInfo(req.baseUrl)
    if (!urlInfo.resource) return null

    const host = req.get('host') || null
    const protocol = host ? req.protocol : null

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
      body: req.body,
      host,
      protocol,
    }
  }

  const parsePutRequest = (req: express.Request) => {
    const urlInfo = getUrlInfo(req.baseUrl)
    if (!urlInfo.resource) return null
    if (!urlInfo.id) return null

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
      body: req.body,
    }
  }

  const parsePatchRequest = parsePutRequest

  const parseDeleteRequest = (req: express.Request) => {
    const urlInfo = getUrlInfo(req.baseUrl)
    if (!urlInfo.resource) return null

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
    }
  }

  const sendResponse = (tembaResponse: TembaResponse, res: express.Response) => {
    res.status(tembaResponse.status)

    if (tembaResponse.headers) {
      for (const [key, value] of Object.entries(tembaResponse.headers)) {
        res.set(key, value)
      }
    }

    res.json(tembaResponse.body)

    res.end()
  }

  const handle = async <T extends TembaRequest>(
    expressRequest: Request,
    expressResponse: Response,
    parseRequest: (req: express.Request) => T | null,
    handleRequest: (request: T) => Promise<TembaResponse>,
  ) => {
    const requestInfo = parseRequest(expressRequest)

    if (
      !requestInfo ||
      (routerConfig.validateResources &&
        !routerConfig.resources.includes(requestInfo.resource.toLowerCase()))
    ) {
      return expressResponse.status(404).json({
        message: 'Unknown resource',
      })
    }

    const response = await handleRequest(requestInfo)
    sendResponse(response, expressResponse)
  }

  const requestHandler = getRequestHandler(queries, schemas, routerConfig)
  const resourceRouter = express.Router()

  resourceRouter.get('*', async (expressRequest, expressResponse) => {
    await handle(expressRequest, expressResponse, parseGetRequest, requestHandler.handleGet)
  })

  resourceRouter.post('*', async (expressRequest, expressResponse) => {
    await handle(expressRequest, expressResponse, parsePostRequest, requestHandler.handlePost)
  })

  resourceRouter.put('*', async (expressRequest, expressResponse) => {
    await handle(expressRequest, expressResponse, parsePutRequest, requestHandler.handlePut)
  })

  resourceRouter.patch('*', async (expressRequest, expressResponse) => {
    await handle(expressRequest, expressResponse, parsePatchRequest, requestHandler.handlePatch)
  })

  resourceRouter.delete('*', async (expressRequest, expressResponse) => {
    await handle(expressRequest, expressResponse, parseDeleteRequest, requestHandler.handleDelete)
  })

  return resourceRouter
}
