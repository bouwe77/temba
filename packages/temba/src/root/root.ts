import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleMethodNotAllowed } from '../resourceHandler'
import { version } from '../version'
import { getHtml } from './html'
import type { Config } from '../config'
import { sendResponse } from '../responseHandler'

const title = 'My API'

const text = (res: ServerResponse<IncomingMessage>) =>
  sendResponse(res)({
    statusCode: 200,
    contentType: 'text/plain',
    body: `${title}\n\nPowered by Temba ${version}`,
  })

const html = (res: ServerResponse<IncomingMessage>, config: Config) => {
  const apiPrefix = config.apiPrefix ? `${config.apiPrefix}/` : ''
  const html = getHtml({
    version,
    title,
    ...(config.openapi && {
      openapi: {
        json: `/${apiPrefix}openapi.json`,
        yaml: `/${apiPrefix}openapi.yaml`,
        html: `/${apiPrefix}openapi.html`,
      },
    }),
  })

  sendResponse(res)({
    statusCode: 200,
    contentType: 'text/html',
    body: html,
  })
}

export const createRootUrlHandler =
  (config: Config) => (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    if (req.method !== 'GET') return handleMethodNotAllowed(res)

    if (req.headers.accept?.includes('text/html')) return html(res, config)

    return text(res)
  }
