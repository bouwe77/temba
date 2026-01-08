import { createServer as httpCreateServer } from 'node:http'
import { initConfig, type UserConfig } from './config'
import type { IncomingMessage, ServerResponse } from 'http'
import { createResourceHandler } from './resourceHandler'
import { handleNotFound, sendErrorResponse } from './responseHandler'
import { getHttpLogger, initLogger } from './log/logger'
import { createOpenApiHandler, getOpenApiPaths } from './openapi'
import { handleStaticFolder } from './staticFolder/staticFolder'
import { getDefaultImplementations } from './implementations'
import { createRootUrlHandler } from './root/root'
import { sendResponse } from './responseHandler'
import { createQueries } from './data/queries'
import { compileSchemas } from './schema/compile'

const removePendingAndTrailingSlashes = (url?: string) => (url ? url.replace(/^\/+|\/+$/g, '') : '')

const handleOptionsRequest = (res: ServerResponse<IncomingMessage>) =>
  sendResponse(res)({
    statusCode: 204,
  })

const createServer = async (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? removePendingAndTrailingSlashes(config.apiPrefix) : ''
  const openapiPaths = getOpenApiPaths(rootPath)
  const { log, logLevel } = initLogger(process.env.LOG_LEVEL)
  const queries = createQueries(config.connectionString, log)
  const schemas = compileSchemas(config.schemas)
  const handleResource = await createResourceHandler(queries, schemas, config)
  const httpLogger = getHttpLogger(logLevel)

  const server = httpCreateServer((req, res) => {
    const implementations = getDefaultImplementations(config)

    httpLogger(req, res, (err) => {
      if (err) return sendErrorResponse(res)

      const requestUrl = removePendingAndTrailingSlashes(req.url)

      const handleRequest = async () => {
        if (req.method === 'OPTIONS') {
          return handleOptionsRequest(res)
        }

        if (config.staticFolder && !`${requestUrl}/`.startsWith(config.apiPrefix + '/')) {
          handleStaticFolder(
            req,
            res,
            async () =>
              await implementations.getStaticFileFromDisk(
                req.url === '/' ? 'index.html' : req.url || 'index.html',
              ),
          )
        } else if (requestUrl === rootPath) {
          createRootUrlHandler(config)(req, res)
        } else if (openapiPaths.includes(requestUrl)) {
          createOpenApiHandler(config, requestUrl, req.headers.host || '')(res)
        } else if (requestUrl.startsWith(rootPath)) {
          await handleResource(req, res)
        } else {
          handleNotFound(res)
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
      // Do not start the server if isTesting is true as supertest starts and stops the server itself.
      if (config.isTesting) {
        log.error('⛔️ Server not started. Remove or disable isTesting from your config.')
        return
      }

      server.listen(config.port, () => {
        log.debug(`✅ Server listening on port ${config.port}`)
      })
      return server
    },
    // Expose the http server
    server,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)
