//TODO rename this file

import type { IncomingMessage, ServerResponse } from 'http'
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

export const noopHandler = (
  _: IncomingMessage,
  __: ServerResponse<IncomingMessage>,
  next: (err?: unknown) => void,
) => next()

export const sendErrorResponse = (
  res: {
    statusCode: number
    setHeader: (arg0: string, arg1: string) => void
    end: (arg0: string) => void
  },
  statusCode: number = 500,
  message: string = 'Internal Server Error',
) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ message }))
}

export const handleMethodNotAllowed = (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => {
  sendErrorResponse(res, 405, 'Method Not Allowed')
}

export const handleNotFound = (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) => {
  sendErrorResponse(res, 404, 'Not Found')
}

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

export const createResourceHandler = (
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) => {
  const getUrlInfo = (baseUrl: string) => {
    const url = routerConfig.apiPrefix ? baseUrl.replace(routerConfig.apiPrefix, '') : baseUrl
    return parseUrl(url)
  }

  const getBody = (request: IncomingMessage) => {
    return new Promise<string>((resolve) => {
      const bodyParts: Buffer[] = []
      let body: string

      request
        .on('data', (chunk: Buffer) => {
          bodyParts.push(chunk)
        })
        .on('end', () => {
          body = Buffer.concat(bodyParts).toString()
          resolve(body)
        })
    })
  }

  const parseRequest = async (req: IncomingMessage) => {
    const urlInfo = getUrlInfo(req.url ?? '')

    // Due to how routing is setup this situation can not happen,
    // so it's mainly to satisfy TypeScript.
    if (!urlInfo.resource || urlInfo.resource.trim().length === 0)
      return createError(404, 'Resource could not be determined from req.baseUrl')

    console.log('req.headers', req.headers)

    const host = req.headers.host ?? null
    //TODO Don't know yet how to determine the protocol from the request...
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const etag = req.headers['if-match'] ?? null

    const body = await getBody(req)

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
      body,
      host,
      protocol,
      method: req.method ?? '',
      headers: req.headers,
      etag,
    } satisfies RequestInfo
  }

  const validateResource = (requestInfo: RequestInfo) => {
    const resourcePaths = routerConfig.resources.map((resource) => {
      return typeof resource === 'string' ? resource : resource.resourcePath
    })

    if (
      routerConfig.validateResources &&
      !resourcePaths.includes((requestInfo.resource ?? '').toLowerCase())
    ) {
      return createError(404, 'Invalid resource')
    }

    return requestInfo
  }

  const sendResponse = (tembaResponse: TembaResponse, res: ServerResponse<IncomingMessage>) => {
    res.statusCode = tembaResponse.status

    if (tembaResponse.headers) {
      for (const [key, value] of Object.entries(tembaResponse.headers)) {
        res.setHeader(key, value)
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify(tembaResponse.body))

    res.end()
  }

  const handle = async <T extends TembaRequest>(
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
    validators: RequestValidator | RequestValidator[],
    convert: (request: RequestInfo) => T,
    handleRequest: (request: T) => Promise<TembaResponse>,
  ) => {
    const requestInfo = await parseRequest(httpRequest)

    if (isError(requestInfo)) {
      // return httpResponse.status(requestInfo.status).json({
      //   message: requestInfo.message,
      // })
      return sendErrorResponse(httpResponse, requestInfo.status, requestInfo.message)
    }

    for (const validator of [validators].flat()) {
      const validationResult = validator(requestInfo)
      if (isError(validationResult)) {
        return sendErrorResponse(httpResponse, validationResult.status, validationResult.message)
      }
    }

    const convertedRequest = convert(requestInfo)

    const response = await handleRequest(convertedRequest)
    sendResponse(response, httpResponse)
  }

  const requestHandler = getRequestHandler(queries, schemas, routerConfig)

  const getHandler = async (
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
  ) => {
    await handle(
      httpRequest,
      httpResponse,
      validateResource,
      convertToGetRequest,
      requestHandler.handleGet,
    )
  }

  const postHandler = async (
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
  ) => {
    await handle(
      httpRequest,
      httpResponse,
      [validateResource, validateIdInUrlNotAllowed, validateIdInRequestBodyNotAllowed],
      convertToPostRequest,
      requestHandler.handlePost,
    )
  }

  const putHandler = async (
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
  ) => {
    await handle(
      httpRequest,
      httpResponse,
      [validateResource, validateIdInUrlRequired, validateIdInRequestBodyNotAllowed],
      convertToPutRequest,
      requestHandler.handlePut,
    )
  }

  const patchHandler = async (
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
  ) => {
    await handle(
      httpRequest,
      httpResponse,
      [validateResource, validateIdInUrlRequired, validateIdInRequestBodyNotAllowed],
      convertToPatchRequest,
      requestHandler.handlePatch,
    )
  }

  const deleteHandler = async (
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
  ) => {
    await handle(
      httpRequest,
      httpResponse,
      validateResource,
      convertToDeleteRequest,
      requestHandler.handleDelete,
    )
  }

  return (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    if (req.method === 'GET') {
      return getHandler(req, res)
    }
    if (req.method === 'POST') {
      return postHandler(req, res)
    }
    if (req.method === 'PUT') {
      return putHandler(req, res)
    }
    if (req.method === 'PATCH') {
      return patchHandler(req, res)
    }
    if (req.method === 'DELETE') {
      return deleteHandler(req, res)
    }
  }
}
