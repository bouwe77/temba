import type { IncomingHttpHeaders } from 'http'

import type {
  InterceptedDeleteRequest,
  InterceptedGetRequest,
  InterceptedPostRequest,
  InterceptedPutRequest,
  InterceptedReturnValue,
} from './types'

export const interceptGetRequest = (
  intercept: InterceptedGetRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
) => {
  intercept({ headers, resource, id })
}

export const interceptPostRequest = (
  intercept: InterceptedPostRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  body: unknown,
) => {
  const intercepted = intercept({ headers, resource, body })
  return interceptRequest(intercepted, body)
}

export const interceptPutRequest = (
  intercept: InterceptedPutRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string,
  body: unknown,
) => {
  const intercepted = intercept({ headers, resource, id, body })
  return interceptRequest(intercepted, body)
}

export const interceptPatchRequest = interceptPutRequest

export const interceptDeleteRequest = (
  intercept: InterceptedDeleteRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
) => {
  intercept({ headers, resource, id })
}

const interceptRequest = (intercepted: InterceptedReturnValue, body: unknown) => {
  if (!intercepted && typeof body === 'object') return body

  // The request body was replaced by an object
  if (intercepted && typeof intercepted === 'object' && !Array.isArray(intercepted))
    return intercepted

  // The request body was replaced by something else than an object.
  // This is not supported, so we return the original request body.
  return body
}
