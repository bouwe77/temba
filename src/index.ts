import { createServer as httpCreateServer } from 'node:http'
import { initConfig, type UserConfig } from './config'
import type { IncomingMessage, ServerResponse } from 'http'
import { createQueries } from './data/queries'
import { compileSchemas } from './schema/compile'
import {
  createResourceHandler,
  handleMethodNotAllowed,
  handleNotFound,
  sendErrorResponse,
} from './resourceHandler'
import { getHttpLogger, initLogger } from './log/logger'
import { createOpenApiHandler } from './openapi/openapi'
import { TembaError as TembaErrorInternal } from './requestInterceptor/TembaError'
import { handleStaticFolder } from './staticFolder/staticFolder'
import { getDefaultImplementations } from './implementations'
import { setCorsHeaders } from './cors/cors'
import { version } from './version'

const handleRootUrl = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) => {
  if (req.method !== 'GET') return handleMethodNotAllowed(req, res)
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  setCorsHeaders(res)
  res.end(`It works! ツ\n\nTemba ${version}`)
}

const removePendingAndTrailingSlashes = (url?: string) => (url ? url.replace(/^\/+|\/+$/g, '') : '')

const handleOptionsRequest = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  res.statusCode = 200
  setCorsHeaders(res)
  res.end()
}

const createServer = (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? removePendingAndTrailingSlashes(config.apiPrefix) : ''
  const openapiPaths = [
    `${rootPath ? `${rootPath}/` : ''}openapi.json`,
    `${rootPath ? `${rootPath}/` : ''}openapi.yaml`,
  ]
  const { log, logLevel } = initLogger(process.env.LOG_LEVEL)
  const queries = createQueries(config.connectionString, log)
  const schemas = compileSchemas(config.schemas)
  const handleResource = createResourceHandler(queries, schemas, config)
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

        if (config.staticFolder && !`${requestUrl}/`.startsWith(config.apiPrefix + '/')) {
          handleStaticFolder(req, res, () =>
            implementations.getStaticFileFromDisk(
              req.url === '/' ? 'index.html' : req.url || 'index.html',
            ),
          )
        } else if (requestUrl === rootPath) {
          handleRootUrl(req, res)
        } else if (openapiPaths.includes(requestUrl)) {
          createOpenApiHandler(requestUrl.endsWith('.json') ? 'json' : 'yaml', config)(req, res)
        } else if (requestUrl.startsWith(rootPath)) {
          handleResource(req, res)
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
