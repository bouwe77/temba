import type { IncomingHttpHeaders } from 'http'

import type { Body } from '../requestHandlers/types'
import {
  createActions,
  isInterceptorAction,
  isResponseAction,
  isSetRequestBodyAction,
} from './interceptorActions'
import type {
  InterceptedDeleteRequest,
  InterceptedGetRequest,
  InterceptedPostRequest,
  InterceptedPutRequest,
  InterceptedReturnValue,
} from './types'

// Result type for interceptor processing
export type InterceptResult =
  | { type: 'continue'; body?: Body }
  | { type: 'response'; status: number; body?: Body }

export const interceptGetRequest = async (
  intercept: InterceptedGetRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
): Promise<InterceptResult> => {
  const actions = createActions()
  const result = await intercept({ headers, resource, id }, actions)
  return processInterceptResult(result)
}

export const interceptPostRequest = async (
  intercept: InterceptedPostRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
  body: Body,
): Promise<InterceptResult> => {
  const actions = createActions()
  const result = await intercept({ headers, resource, body, id }, actions)
  return processInterceptResult(result, body)
}

export const interceptPutRequest = async (
  intercept: InterceptedPutRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string,
  body: Body,
): Promise<InterceptResult> => {
  const actions = createActions()
  const result = await intercept({ headers, resource, id, body }, actions)
  return processInterceptResult(result, body)
}

export const interceptPatchRequest = interceptPutRequest

export const interceptDeleteRequest = async (
  intercept: InterceptedDeleteRequest,
  headers: IncomingHttpHeaders,
  resource: string,
  id: string | null,
): Promise<InterceptResult> => {
  const actions = createActions()
  const result = await intercept({ headers, resource, id }, actions)
  return processInterceptResult(result)
}

// Process the interceptor return value and convert to InterceptResult
const processInterceptResult = (
  intercepted: InterceptedReturnValue,
  originalBody?: Body,
): InterceptResult => {
  // If void/undefined, continue with original body
  if (intercepted === undefined) {
    return { type: 'continue', body: originalBody }
  }

  // If it's an interceptor action, process it
  if (isInterceptorAction(intercepted)) {
    if (isSetRequestBodyAction(intercepted)) {
      return { type: 'continue', body: intercepted.body as Body }
    }

    if (isResponseAction(intercepted)) {
      return { type: 'response', status: intercepted.status, body: intercepted.body as Body }
    }
  }

  // Legacy behavior removed - plain objects are no longer supported
  // If we get here, the return value is invalid (e.g., plain object, number, string, boolean, etc.)
  // We treat it as void and continue with the original body
  // Developers should use actions.setRequestBody() or actions.response() instead
  return { type: 'continue', body: originalBody }
}
