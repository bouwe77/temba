import type { IncomingMessage, ServerResponse } from 'http'
import { setCorsHeaders } from './cors/cors'
import type { Body } from './requestHandlers/types'

export type Response = {
  statusCode: number
  headers?: Record<string, string>
  body?: Body
  contentType?: string
}

export const sendResponse = (res: ServerResponse<IncomingMessage>) => (response: Response) => {
  res.statusCode = response.statusCode

  if (response.headers) {
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }

  setCorsHeaders(res)

  if (response.body) {
    const body =
      typeof response.body === 'string' || Buffer.isBuffer(response.body)
        ? response.body
        : JSON.stringify(response.body)

    if (response.contentType) {
      res.setHeader('Content-Type', response.contentType)
    } else if (typeof response.body === 'string') {
      res.setHeader('Content-Type', 'text/plain')
    } else {
      res.setHeader('Content-Type', 'application/json')
    }

    res.write(body)
  }

  res.end()
}
