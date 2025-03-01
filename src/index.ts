import { createServer as httpCreateServer } from 'node:http'
import { initConfig, type UserConfig } from './config'
import type { IncomingMessage, ServerResponse } from 'http'
import { createQueries } from './data/queries'
import { compileSchemas } from './schema/compile'
import {
  createResourceHandler,
  handleMethodNotAllowed,
  handleNotFound,
  noopHandler,
  sendErrorResponse,
} from './resourceHandler'
import { initLogger } from './log/logger'
import { createOpenApiHandler } from './openapi/openapi'
import morgan from 'morgan'
import { TembaError as TembaErrorInternal } from './requestInterceptor/TembaError'
import { handleStaticFolder } from './staticFolder/staticFolder'
import { getDefaultImplementations } from './implementations'

const handleRootUrl = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) => {
  if (req.method !== 'GET') return handleMethodNotAllowed(req, res)
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('It works! ツ')
}

const removePendingAndTrailingSlashes = (url?: string) => (url ? url.replace(/^\/+|\/+$/g, '') : '')

const createServer = (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? removePendingAndTrailingSlashes(config.apiPrefix) : ''
  const openapiPaths = [
    `${rootPath ? `${rootPath}/` : ''}openapi.json`,
    `${rootPath ? `${rootPath}/` : ''}openapi.yaml`,
  ]
  const { logger, logLevel } = initLogger(process.env.LOG_LEVEL)
  const queries = createQueries(config.connectionString, logger)
  const schemas = compileSchemas(config.schemas)
  const handleResource = createResourceHandler(queries, schemas, config)
  const httpLogger = logLevel === 'debug' ? morgan('tiny') : noopHandler
  const server = httpCreateServer((req, res) => {
    const implementations = getDefaultImplementations(config)

    httpLogger(req, res, (err) => {
      if (err) return sendErrorResponse(res)

      const requestUrl = removePendingAndTrailingSlashes(req.url)

      const handleRequest = () => {
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
        logger.info('⛔️ Server not started. Remove or disable isTesting from your config.')
        return
      }

      server.listen(config.port, () => {
        console.log(`✅ Server listening on port ${config.port}`)
      })
      return server
    },
    // Expose the http server    for testing purposes only, e.g. usage with supertest.
    server: config.isTesting ? server : undefined,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)

export const TembaError = TembaErrorInternal
