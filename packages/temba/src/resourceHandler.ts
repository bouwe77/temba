import type { IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import type { Config } from './config'
import type { Queries } from './data/types'
import { prepareFilter, validateFilter, type Filter } from './filtering/filter'
import { parseQueryString } from './queryStrings/parseQueryString'
import { getRequestHandler } from './requestHandlers'
import type {
  Body,
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
  RequestInfo,
  TembaRequest,
} from './requestHandlers/types'
import { sendErrorResponse, sendResponse, type Response } from './responseHandler'
import type { CompiledSchemas } from './schema/types'
import { parseUrl } from './urls/urlParser'
import type { BroadcastFunction } from './websocket/websocket'

type RequestValidationError = {
  statusCode: number
  message: string
}

const isError = (
  request: RequestInfo | RequestValidationError,
): request is RequestValidationError => {
  return 'statusCode' in request
}

const createError = (statusCode: number, message: string) => {
  return { statusCode, message } satisfies RequestValidationError
}

const validateIdInUrlRequired = (requestInfo: RequestInfo) => {
  return !requestInfo.id ? createError(400, 'An id is required in the URL') : requestInfo
}

const validateIdInRequestBodyNotAllowed = (requestInfo: RequestInfo) => {
  return requestInfo.body && typeof requestInfo.body === 'object' && 'id' in requestInfo.body
    ? createError(400, 'An id is not allowed in the request body')
    : requestInfo
}

const hasMalformedBrackets = (queryString: string): boolean => {
  let depth = 0
  for (const char of queryString) {
    if (char === '[') depth++
    else if (char === ']') depth--
    if (depth < 0) return true
  }
  return depth !== 0
}

const getFilter = (queryString: string | null): Filter | null | 'invalid' => {
  if (!queryString) return null

  if (hasMalformedBrackets(queryString)) return 'invalid'

  const parsedQueryString = parseQueryString(queryString)
  const result = validateFilter(parsedQueryString)

  if (result === 'valid') return prepareFilter(parsedQueryString as Filter)
  if (result === 'invalid') return 'invalid'
  return null
}

const convertToGetRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    id: requestInfo.id,
    resource: requestInfo.resource,
    method: requestInfo.method.toUpperCase() === 'HEAD' ? 'head' : 'get',
    ifNoneMatchEtag: requestInfo.ifNoneMatchEtag,
    filter: getFilter(requestInfo.queryString),
  } satisfies GetRequest
}

const convertToPostRequest = (requestInfo: RequestInfo) => {
  return {
    headers: requestInfo.headers,
    id: requestInfo.id ?? null,
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
    filter: getFilter(requestInfo.queryString),
  } satisfies DeleteRequest
}

type RequestValidator = (requestInfo: RequestInfo) => RequestInfo | RequestValidationError

export const createResourceHandler = async (
  queries: Queries,
  schemas: CompiledSchemas,
  config: Config,
  broadcast: BroadcastFunction | null,
) => {
  const getUrlInfo = (baseUrl: string) => {
    const url = config.apiPrefix ? baseUrl.replace(config.apiPrefix, '') : baseUrl
    return parseUrl(url)
  }

  const getBody = (request: IncomingMessage): Promise<Body | null> => {
    return new Promise((resolve, reject) => {
      const bodyParts: Buffer[] = []

      request
        .on('data', (chunk: Buffer) => {
          bodyParts.push(chunk)
        })
        .on('end', () => {
          try {
            const body = Buffer.concat(bodyParts).toString()
            if (!body) return resolve(null)
            resolve(JSON.parse(body))
          } catch {
            reject(new Error('Invalid JSON'))
          }
        })
        .on('error', (err) => reject(err))
    })
  }

  const getQueryString = (req: IncomingMessage): string | null => {
    const parsedUrl = parse(req.url || '', true)
    return parsedUrl.search || null
  }

  const parseRequest = async (req: IncomingMessage) => {
    const urlInfo = getUrlInfo(req.url ?? '')

    // Due to how routing is setup this situation can not happen,
    // so it's mainly to satisfy TypeScript.
    if (!urlInfo.resource || urlInfo.resource.trim().length === 0)
      return createError(404, 'Resource could not be determined from req.baseUrl')

    const host = req.headers.host || null
    const protoHeader = req.headers['x-forwarded-proto']
    const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ?? 'http'

    const body = await getBody(req)

    return {
      id: urlInfo.id,
      resource: urlInfo.resource,
      body,
      host,
      protocol,
      method: req.method ?? '',
      headers: req.headers,
      etag: req.headers['if-match'] ?? null,
      ifNoneMatchEtag: req.headers['if-none-match'] ?? null,
      queryString: getQueryString(req),
    } satisfies RequestInfo
  }

  const validateResource = (requestInfo: RequestInfo) => {
    const resourcePaths = config.resources.map((resource) => {
      return typeof resource === 'string' ? resource : resource.resourcePath
    })

    if (
      config.validateResources &&
      !resourcePaths.includes((requestInfo.resource ?? '').toLowerCase())
    ) {
      return createError(404, 'Invalid resource')
    }

    return requestInfo
  }

  const handle = async <T extends TembaRequest>(
    httpRequest: IncomingMessage,
    httpResponse: ServerResponse<IncomingMessage>,
    validators: RequestValidator | RequestValidator[],
    convert: (request: RequestInfo) => T,
    handleRequest: (request: T) => Promise<Response>,
  ) => {
    const requestInfo = await parseRequest(httpRequest)

    if (isError(requestInfo)) {
      return sendErrorResponse(httpResponse, requestInfo.statusCode, requestInfo.message)
    }

    for (const validator of [validators].flat()) {
      const validationResult = validator(requestInfo)
      if (isError(validationResult)) {
        return sendErrorResponse(
          httpResponse,
          validationResult.statusCode,
          validationResult.message,
        )
      }
    }

    const convertedRequest = convert(requestInfo)

    const response = await handleRequest(convertedRequest)
    sendResponse(httpResponse)(response)
  }

  const requestHandler = await getRequestHandler(queries, schemas, config, broadcast)

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
      [validateResource, validateIdInRequestBodyNotAllowed],
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
    if (['GET', 'HEAD'].includes(req.method ?? '')) return getHandler(req, res)
    if (req.method === 'POST') return postHandler(req, res)
    if (req.method === 'PUT') return putHandler(req, res)
    if (req.method === 'PATCH') return patchHandler(req, res)
    if (req.method === 'DELETE') return deleteHandler(req, res)
  }
}
