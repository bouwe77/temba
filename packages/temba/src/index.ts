import type { IncomingMessage, ServerResponse } from 'http'
import { createServer as httpCreateServer } from 'node:http'
import { initConfig, type UserConfig } from './config'
import { createQueries } from './data/queries'
import { getDefaultImplementations } from './implementations'
import { getHttpLogger, initLogger } from './log/logger'
import { createOpenApiHandler, getOpenApiPaths } from './openapi'
import { interceptNonResourceGetRequest } from './requestInterceptor/interceptRequest'
import { createResourceHandler } from './resourceHandler'
import {
  handleMethodNotAllowed,
  handleNotFound,
  sendErrorResponse,
  sendResponse,
} from './responseHandler'
import { handleOptionsRequest } from './requestHandlers/optionsHandler'
import { createRootUrlHandler } from './root/root'
import { compileSchemas } from './schema/compile'
import { handleStaticFolder } from './staticFolder/staticFolder'
import { createWebSocketServer, type BroadcastFunction } from './websocket/websocket'

const removePendingAndTrailingSlashes = (url?: string) => (url ? url.replace(/^\/+|\/+$/g, '') : '')

const createServer = async (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? removePendingAndTrailingSlashes(config.apiPrefix) : ''
  const openapiPaths = getOpenApiPaths(rootPath)
  const { log, logLevel } = initLogger(process.env.LOG_LEVEL)
  const queries = createQueries(config.connectionString, log, config.isTesting)
  const schemas = compileSchemas(config.schemas)
  const httpLogger = getHttpLogger(logLevel)

  // Create the server first without the request handler
  const server = httpCreateServer()

  // Initialize WebSocket server if enabled (must be after server creation)
  const broadcast: BroadcastFunction | null = config.webSocket
    ? createWebSocketServer(server)
    : null

  // Now create the resource handler with the broadcast function
  const handleResource = await createResourceHandler(queries, schemas, config, broadcast)

  // Set up the request handler
  server.on('request', (req, res) => {
    const implementations = getDefaultImplementations(config)

    httpLogger(req, res, (err) => {
      if (err) return sendErrorResponse(res, 500, 'Internal Server Error', config.cors)

      const requestUrl = removePendingAndTrailingSlashes(req.url?.split('?')[0])

      const handleRequest = async () => {
        if (req.method === 'OPTIONS') {
          return handleOptionsRequest(res, config.cors)
        }

        const protoHeader = req.headers['x-forwarded-proto']
        const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ?? 'http'
        const fullUrl = `${protocol}://${req.headers.host ?? ''}${req.url ?? ''}`

        if (config.staticFolder && !`${requestUrl}/`.startsWith(config.apiPrefix + '/')) {
          // Only GET and HEAD are supported for static files
          if (req.method !== 'GET' && req.method !== 'HEAD') return handleMethodNotAllowed(res, config.cors)

          // Run interceptor before serving static file
          if (config.requestInterceptor?.get) {
            const interceptResult = await interceptNonResourceGetRequest(
              config.requestInterceptor.get,
              req.headers,
              'static',
              fullUrl,
            )
            if (interceptResult.type === 'response') {
              return sendResponse(res, config.cors)({
                statusCode: interceptResult.status,
                body: interceptResult.body,
              })
            }
          }

          handleStaticFolder(
            req,
            res,
            async () =>
              await implementations.getStaticFileFromDisk(
                req.url === '/' ? 'index.html' : req.url || 'index.html',
              ),
            config.cors,
          )
        } else if (requestUrl === rootPath) {
          // Only GET is supported for the root URL
          if (req.method !== 'GET') return handleMethodNotAllowed(res, config.cors)

          // Run interceptor before serving root URL
          if (config.requestInterceptor?.get) {
            const interceptResult = await interceptNonResourceGetRequest(
              config.requestInterceptor.get,
              req.headers,
              'root',
              fullUrl,
            )
            if (interceptResult.type === 'response') {
              return sendResponse(res, config.cors)({
                statusCode: interceptResult.status,
                body: interceptResult.body,
              })
            }
          }

          createRootUrlHandler(config)(req, res)
        } else if (openapiPaths.includes(requestUrl)) {
          // Only GET is supported for the OpenAPI URL
          if (req.method !== 'GET') return handleMethodNotAllowed(res, config.cors)

          // Run interceptor before serving OpenAPI
          if (config.requestInterceptor?.get) {
            const interceptResult = await interceptNonResourceGetRequest(
              config.requestInterceptor.get,
              req.headers,
              'openapi',
              fullUrl,
            )
            if (interceptResult.type === 'response') {
              return sendResponse(res, config.cors)({
                statusCode: interceptResult.status,
                body: interceptResult.body,
              })
            }
          }

          createOpenApiHandler(config, requestUrl, req.headers.host || '')(res)
        } else if (requestUrl.startsWith(rootPath)) {
          await handleResource(req, res)
        } else {
          handleNotFound(res, config.cors)
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

/**
 * Creates a Temba REST API server with the specified configuration.
 *
 * Temba provides a zero-configuration REST API that supports CRUD operations
 * for any resource. Data can be stored in-memory, in JSON files, or in MongoDB.
 *
 * @param userConfig - Optional configuration object to customize the server behavior
 * @returns A promise that resolves to an object containing:
 *   - `start()`: Function to start the HTTP server
 *   - `server`: The underlying Node.js HTTP server instance
 *
 * @example
 * ```typescript
 * // Create a basic server with default settings
 * const server = await create()
 * server.start()
 *
 * // Create a server with custom configuration
 * const server = await create({
 *   port: 3000,
 *   resources: ['movies', 'actors'],
 *   connectionString: 'mongodb://localhost:27017/mydb'
 * })
 * server.start()
 * ```
 */
export const create = (userConfig?: UserConfig) => createServer(userConfig)

// Export the main UserConfig type for TypeScript users
export type { UserConfig } from './config'
