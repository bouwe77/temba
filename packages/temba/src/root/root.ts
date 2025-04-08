import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleMethodNotAllowed } from '../resourceHandler'
import { setCorsHeaders } from '../cors/cors'
import { version } from '../version'
import { getHtml } from './html'
import type { Config } from '../config'

const title = 'My API'

const text = (res: ServerResponse<IncomingMessage>) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  setCorsHeaders(res)
  res.end(`${title}\n\nPowered by Temba ${version}`)
}

const html = (res: ServerResponse<IncomingMessage>, config: Config) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  setCorsHeaders(res)
  res.end(
    getHtml({
      version,
      title,
      ...(config.openapi && {
        openapi: {
          json: `/${config.apiPrefix ? `${config.apiPrefix}/` : ''}openapi.json`,
          yaml: `/${config.apiPrefix ? `${config.apiPrefix}/` : ''}openapi.yaml`,
          html: `/${config.apiPrefix ? `${config.apiPrefix}/` : ''}openapi.html`,
        },
      }),
    }),
  )
}

export const createRootUrlHandler =
  (config: Config) =>
  (req: IncomingMessage, res: ServerResponse<IncomingMessage> & { req: IncomingMessage }) => {
    if (req.method !== 'GET') return handleMethodNotAllowed(req, res)

    if (req.headers.accept?.includes('text/html')) return html(res, config)

    return text(res)
  }
