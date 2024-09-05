import express from 'express'
import type { Response, Request } from 'express'
import { getRequestHandler } from './requestHandlers'
import { parseUrl } from './urls/urlParser'
import type {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
  RequestInfo,
  TembaRequest,
  TembaResponse,
} from './requestHandlers/types'
import type { Queries } from './data/types'
import type { CompiledSchemas } from './schema/types'
import type { RouterConfig } from './config'

type RequestValidationError = {
  status: number
  message: string
}

const isError = (
  request: RequestInfo | RequestValidationError,
): request is RequestValidationError => {
  return 'status' in request
}

const createError = (status: number, message: string) => {
  return { status, message } satisfies RequestValidationError
}

const validateIdInUrlRequired = (requestInfo: RequestInfo) => {
  return !requestInfo.id ? createError(400, 'An id is required in the URL') : requestInfo
}

const validateIdInUrlNotAllowed = (requestInfo: RequestInfo) => {
  return requestInfo.id ? createError(400, 'An id is not allowed in the URL') : requestInfo
}

const validateIdInRequestBodyNotAllowed = (requestInfo: RequestInfo) => {
  return requestInfo.body && typeof requestInfo.body === 'object' && 'id' in requestInfo.body
    ? createError(400, 'An id is not allowed in the request body')
    : requestInfo
}

const convertToGetRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    id: requestInfo.id,
    resource: requestInfo.resource,
    isHeadRequest: requestInfo.method.toUpperCase() === 'HEAD',
  } satisfies GetRequest
}

const convertToPostRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    resource: requestInfo.resource,
    body: requestInfo.body ?? {},
    protocol: requestInfo.protocol,
    host: requestInfo.host,
  } satisfies PostRequest
}

const convertToPutRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    id: requestInfo.id!,
    resource: requestInfo.resource,
    body: requestInfo.body ?? {},
    etag: requestInfo.etag ?? null,
  } satisfies PutRequest
}

const convertToPatchRequest = convertToPutRequest

const convertToDeleteRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    id: requestInfo.id,
    resource: requestInfo.resource,
    etag: requestInfo.etag ?? null,
  } satisfies DeleteRequest
}

type RequestValidator = (requestInfo: RequestInfo) => RequestInfo | RequestValidationError

export const createResourceRouter = (
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) => {
  const getUrlInfo = (baseUrl: string) => {
    const url = routerConfig.apiPrefix ? baseUrl.replace(routerConfig.apiPrefix, '') : baseUrl
    return parseUrl(url)
  }

  const parseRequest = (req: express.Request) => {
    const urlInfo = getUrlInfo(req.baseUrl)
    if (!urlInfo.resource || urlInfo.resource.trim().length === 0)
      return createError(400, 'Unknown resource')

    const host = req.get('host') || null
    const protocol = host ? req.protocol : null
    const etag = req.headers['if-match'] ?? null

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
      body: req.body,
      host,
      protocol,
      method: req.method,
      headers: req.headers,
      etag,
    } satisfies RequestInfo
  }

  const validateResource = (requestInfo: RequestInfo) => {
    if (
      routerConfig.validateResources &&
      !routerConfig.resources.includes((requestInfo.resource ?? '').toLowerCase())
    ) {
      return createError(400, 'Invalid resource')
    }

    return requestInfo
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
    validators: RequestValidator | RequestValidator[],
    convert: (request: RequestInfo) => T,
    handleRequest: (request: T) => Promise<TembaResponse>,
  ) => {
    const requestInfo = parseRequest(expressRequest)

    if (isError(requestInfo)) {
      return expressResponse.status(requestInfo.status).json({
        message: requestInfo.message,
      })
    }

    for (const validator of [validators].flat()) {
      const validationResult = validator(requestInfo)
      if (isError(validationResult)) {
        return expressResponse.status(validationResult.status).json({
          message: validationResult.message,
        })
      }
    }

    const convertedRequest = convert(requestInfo)

    const response = await handleRequest(convertedRequest)
    sendResponse(response, expressResponse)
  }

  const requestHandler = getRequestHandler(queries, schemas, routerConfig)
  const resourceRouter = express.Router()

  resourceRouter.get('*', async (expressRequest, expressResponse) => {
    await handle(
      expressRequest,
      expressResponse,
      validateResource,
      convertToGetRequest,
      requestHandler.handleGet,
    )
  })

  resourceRouter.post('*', async (expressRequest, expressResponse) => {
    await handle(
      expressRequest,
      expressResponse,
      [validateResource, validateIdInUrlNotAllowed, validateIdInRequestBodyNotAllowed],
      convertToPostRequest,
      requestHandler.handlePost,
    )
  })

  resourceRouter.put('*', async (expressRequest, expressResponse) => {
    await handle(
      expressRequest,
      expressResponse,
      [validateResource, validateIdInUrlRequired, validateIdInRequestBodyNotAllowed],
      convertToPutRequest,
      requestHandler.handlePut,
    )
  })

  resourceRouter.patch('*', async (expressRequest, expressResponse) => {
    await handle(
      expressRequest,
      expressResponse,
      [validateResource, validateIdInUrlRequired, validateIdInRequestBodyNotAllowed],
      convertToPatchRequest,
      requestHandler.handlePatch,
    )
  })

  resourceRouter.delete('*', async (expressRequest, expressResponse) => {
    await handle(
      expressRequest,
      expressResponse,
      validateResource,
      convertToDeleteRequest,
      requestHandler.handleDelete,
    )
  })

  return resourceRouter
}
