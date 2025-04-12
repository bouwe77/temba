import type { Config } from '../config'
import type { IncomingMessage, ServerResponse } from 'http'
import { handleNotFound } from '../resourceHandler'
import { getSpec } from './spec'
import { getOpenApiHtml } from './html'
import { sendResponse } from '../responseHandler'

export const getOpenApiPaths = (rootPath: string) => {
  return [
    `${rootPath ? `${rootPath}/` : ''}openapi.json`,
    `${rootPath ? `${rootPath}/` : ''}openapi.yaml`,
    `${rootPath ? `${rootPath}/` : ''}openapi.html`,
    `${rootPath ? `${rootPath}/` : ''}openapi`,
  ]
}

export const createOpenApiHandler = (config: Config, requestUrl: string, requestHost: string) => {
  const openApiHandler = async (res: ServerResponse<IncomingMessage>) => {
    if (!config.openapi) {
      return handleNotFound(res)
    }

    const format =
      requestUrl.endsWith('.yaml') || requestUrl.endsWith('.yml')
        ? 'yaml'
        : requestUrl.endsWith('.json')
          ? 'json'
          : 'html'

    const contentType = {
      json: 'application/json',
      yaml: 'application/yaml',
      html: 'text/html',
    }[format]

    const body =
      format === 'html' ? getOpenApiHtml() : getSpec(config, { format, host: requestHost })

    sendResponse(res)({
      statusCode: 200,
      contentType: contentType,
      body,
    })
  }

  return openApiHandler
}
