import { ExtendedRequest, RequestBodyInterceptorCallback } from './types'

function interceptRequestBody(intercept: RequestBodyInterceptorCallback, req: ExtendedRequest) {
  const {
    body,
    requestInfo: { resource },
  } = req

  const intercepted = intercept({ resource, body })

  if (!intercepted && typeof body === 'object') return body

  if (typeof intercepted === 'string') return intercepted

  // The request body was replaced by an object
  if (intercepted && typeof body === 'object') return intercepted

  // The request body was replaced by something else than an object or a string.
  // This is not supported, so we return the original request body.
  return body
}

export { interceptRequestBody }
