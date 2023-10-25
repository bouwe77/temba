import { RequestBodyInterceptorCallback } from './types'

function interceptRequestBody(intercept: RequestBodyInterceptorCallback, req): string | object {
  const { resource } = req.requestInfo
  let body = req.body

  const validationResult = intercept({ resource, body })

  if (!validationResult && typeof body === 'object') return body

  if (typeof validationResult === 'string') return validationResult

  // The request body was replaced by something else.
  if (validationResult) body = validationResult

  if (typeof body === 'object') {
    return body
  } else return req.body
}

export { interceptRequestBody }
