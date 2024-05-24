import type { InterceptedPostRequest, InterceptedPutRequest, InterceptedReturnValue } from './types'

export const interceptPostRequest = (
  intercept: InterceptedPostRequest,
  resource: string,
  body: unknown,
) => {
  const intercepted = intercept({ resource, body })
  return interceptRequest(intercepted, body)
}

export const interceptPutRequest = (
  intercept: InterceptedPutRequest,
  resource: string,
  id: string,
  body: unknown,
) => {
  const intercepted = intercept({ resource, id, body })
  return interceptRequest(intercepted, body)
}

export const interceptPatchRequest = interceptPutRequest

const interceptRequest = (intercepted: InterceptedReturnValue, body: unknown) => {
  if (!intercepted && typeof body === 'object') return body

  // The request body was replaced by an object
  if (intercepted && typeof intercepted === 'object' && !Array.isArray(intercepted))
    return intercepted

  // The request body was replaced by something else than an object.
  // This is not supported, so we return the original request body.
  return body
}
