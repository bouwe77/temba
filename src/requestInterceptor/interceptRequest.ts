import type { RequestInterceptorCallback } from './types'

export const interceptRequest = (
  intercept: RequestInterceptorCallback,
  resource: string,
  body: unknown,
) => {
  const intercepted = intercept({ resource, body })

  if (!intercepted && typeof body === 'object') return body

  if (typeof intercepted === 'string') return intercepted

  // The request body was replaced by an object
  if (intercepted && typeof intercepted === 'object' && !Array.isArray(intercepted))
    return intercepted

  // The request body was replaced by something else than an object or a string.
  // This is not supported, so we return the original request body.
  return body
}
