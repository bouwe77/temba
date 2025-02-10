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

const handleRootUrl = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) => {
  if (req.method !== 'GET') return handleMethodNotAllowed(req, res)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('It works! ツ')
}

const createServer = (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const rootPath = config.apiPrefix ? `${config.apiPrefix}` : '/'

  const { logger, logLevel } = initLogger(process.env.LOG_LEVEL)
  const queries = createQueries(config.connectionString, logger)
  const resourcePath = config.apiPrefix ? `/${config.apiPrefix}/` : '/'
  const schemas = compileSchemas(config.schemas)
  const handleResource = createResourceHandler(queries, schemas, config)
  const httpLogger = logLevel === 'debug' ? morgan('tiny') : noopHandler

  const server = httpCreateServer((req, res) => {
    httpLogger(req, res, (err) => {
      if (err) {
        return sendErrorResponse(res)
      }

      const handleRequest = () => {
        if (!req.url || req.url === rootPath) {
          handleRootUrl(req, res)
        } else if (req.url === '/openapi.json' || req.url === '/openapi.yaml') {
          const format = req.url.endsWith('.json') ? 'json' : 'yaml'
          const handleOpenApi = createOpenApiHandler(format, config)
          handleOpenApi(req, res)
        } else if (req.url.startsWith(resourcePath)) {
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
      server.listen(config.port, () => {
        console.log(`✅ Server listening on port ${config.port}`)
      })
      return server
    },
    //TODO hier maar ff de server teruggeven zodat ik een ongestarte server kan gebruiken in de tests...
    server,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)
