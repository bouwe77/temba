import type { IncomingMessage, ServerResponse } from 'http'
import { setCorsHeaders } from './cors/cors'

export type Response = {
  statusCode: number
  headers?: Record<string, string>
  body?: unknown
  contentType?: string
}

export const sendResponse = (res: ServerResponse<IncomingMessage>) => (response: Response) => {
  res.statusCode = response.statusCode

  if (response.headers) {
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }
  res.setHeader('Content-Type', response.contentType || 'application/json')
  setCorsHeaders(res)

  if (response.body) {
    res.write(JSON.stringify(response.body))
  }

  res.end()
}
