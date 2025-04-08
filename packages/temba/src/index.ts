import { createServer as httpCreateServer } from 'node:http'
import { initConfig, type UserConfig } from './config'
import type { IncomingMessage, ServerResponse } from 'http'
import { createResourceHandler, handleNotFound, sendErrorResponse } from './resourceHandler'
import { getHttpLogger, initLogger } from './log/logger'
import { createOpenApiHandler } from './openapi/openapi'
import { TembaError as TembaErrorInternal } from './requestInterceptor/TembaError'
import { handleStaticFolder } from './staticFolder/staticFolder'
import { getDefaultImplementations } from './implementations'
import { setCorsHeaders } from './cors/cors'
import { createRootUrlHandler } from './root/root'
import { readFileSync } from 'node:fs'

const removePendingAndTrailingSlashes = (url?: string) => (url ? url.replace(/^\/+|\/+$/g, '') : '')

const handleOptionsRequest = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  res.statusCode = 200
  setCorsHeaders(res)
  res.end()
}

const createServer = (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? removePendingAndTrailingSlashes(config.apiPrefix) : ''
  const openapiSpecPaths = [
    `${rootPath ? `${rootPath}/` : ''}openapi.json`,
    `${rootPath ? `${rootPath}/` : ''}openapi.yaml`,
  ]
  const openapiHtmlPaths = [
    `${rootPath ? `${rootPath}/` : ''}openapi.html`,
    `${rootPath ? `${rootPath}/` : ''}openapi`,
  ]
  const { log, logLevel } = initLogger(process.env.LOG_LEVEL)
  const httpLogger = getHttpLogger(logLevel)

  const server = httpCreateServer((req, res) => {
    const implementations = getDefaultImplementations(config)

    httpLogger(req, res, (err) => {
      if (err) return sendErrorResponse(res)

      const requestUrl = removePendingAndTrailingSlashes(req.url)

      const handleRequest = () => {
        if (req.method === 'OPTIONS') {
          return handleOptionsRequest(req, res)
        }

        if (openapiHtmlPaths.includes(requestUrl)) {
          try {
            const file = readFileSync('openapi.html')
            setCorsHeaders(res)
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(file)
          } catch {
            res.writeHead(404)
            res.end('Not found')
          }
          return
        }

        if (config.staticFolder && !`${requestUrl}/`.startsWith(config.apiPrefix + '/')) {
          handleStaticFolder(req, res, () =>
            implementations.getStaticFileFromDisk(
              req.url === '/' ? 'index.html' : req.url || 'index.html',
            ),
          )
        } else if (requestUrl === rootPath) {
          createRootUrlHandler(config)(req, res)
        } else if (openapiSpecPaths.includes(requestUrl)) {
          createOpenApiHandler(requestUrl.endsWith('.json') ? 'json' : 'yaml', config)(req, res)
        } else if (requestUrl.startsWith(rootPath)) {
          createResourceHandler(log, config)(req, res)
        } else {
          handleNotFound(req, res)
        }
      }

      if (config.delay > 0) {
        setTimeout(handleRequest, config.delay)
      } else {
        handleRequest()
      }
    })
  })

  return {
    start: () => {
      if (config.isTesting) {
        log.error('⛔️ Server not started. Remove or disable isTesting from your config.')
        return
      }

      server.listen(config.port, () => {
        log.debug(`✅ Server listening on port ${config.port}`)
      })
      return server
    },
    // Expose the http server    for testing purposes only, e.g. usage with supertest.
    server: config.isTesting ? server : undefined,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)

export const TembaError = TembaErrorInternal
