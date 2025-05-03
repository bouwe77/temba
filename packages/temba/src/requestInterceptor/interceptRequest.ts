import type { IncomingHttpHeaders } from 'http'

import type {
  InterceptedDeleteRequest,
  InterceptedGetRequest,
  InterceptedPostRequest,
  InterceptedPutRequest,
  InterceptedReturnValue,
} from './types'
import type { Body } from '../requestHandlers/types'

export const interceptGetRequest = async (
  intercept: InterceptedGetRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
) => {
  await intercept({ headers, resource, id })
}

export const interceptPostRequest = async (
  intercept: InterceptedPostRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
  body: Body,
) => {
  const intercepted = await intercept({ headers, resource, body, id })
  return interceptRequest(intercepted, body)
}

export const interceptPutRequest = async (
  intercept: InterceptedPutRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string,
  body: Body,
) => {
  const intercepted = await intercept({ headers, resource, id, body })
  return interceptRequest(intercepted, body)
}

export const interceptPatchRequest = interceptPutRequest

export const interceptDeleteRequest = async (
  intercept: InterceptedDeleteRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
) => {
  await intercept({ headers, resource, id })
}

const interceptRequest = (intercepted: InterceptedReturnValue, body: Body) => {
  if (!intercepted && typeof body === 'object') return body

  // The request body was replaced by an object
  if (intercepted && typeof intercepted === 'object' && !Array.isArray(intercepted))
    return intercepted

  // The request body was replaced by something else than an object.
  // This is not supported, so we return the original request body.
  return body
}
