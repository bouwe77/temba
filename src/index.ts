import express, { json } from 'express'
import type { Response, Request } from 'express'
import morgan from 'morgan'
import { createQueries } from './data/queries'
import { initConfig } from './config'
import type { UserConfig } from './config'
import cors from 'cors'
import { createDelayMiddleware } from './delay/delayMiddleware'
import { compileSchemas } from './schema/compile'
import { createResourceRouter } from './resourceRouter'
import { TembaError as TembaErrorInternal } from './requestInterceptor/TembaError'
import { initLogger } from './log/logger'
import { etag } from './etags/etags'
import type { StatsLike } from 'etag'
import { createOpenApiRouter } from './openapi/openapi'

// Route for handling not allowed methods.
const handleMethodNotAllowed = (_: Request, res: Response) => {
  res.status(405).json({ message: 'Method Not Allowed' })
}

// Route for handling not found.
const handleNotFound = (_: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' })
}

const createServer = (userConfig?: UserConfig) => {
  const { logger, logLevel } = initLogger(process.env.LOG_LEVEL)

  const config = initConfig(userConfig)

  const queries = createQueries(config.connectionString, logger)

  const app = express()
  app.use(json())

  app.set('etag', config.etags ? (entity: string | Buffer | StatsLike) => etag(entity) : false)

  // Add HTTP request logging.
  if (logLevel === 'debug') app.use(morgan('tiny'))

  // Enable CORS for all requests.
  app.use(cors({ origin: true, credentials: true }))

  // Serve a static folder, if configured.
  if (config.staticFolder) {
    app.use(express.static(config.staticFolder))
  }

  // Add a delay to every request, if configured.
  if (config.delay > 0) {
    const delayMiddleware = createDelayMiddleware(config.delay)
    app.use(delayMiddleware)
  }

  // On the root URL (with apiPrefix, if applicable) only a GET is allowed.
  const rootRouter = express.Router()
  const rootPath = config.apiPrefix ? `${config.apiPrefix}` : '/'
  app.use(rootPath, rootRouter)

  // Use a custom router, if configured.
  if (config.customRouter) {
    app.use(config.customRouter)
  }

  app.use('/openapi.json', createOpenApiRouter('json', config))
  app.use('/openapi.yaml', createOpenApiRouter('yaml', config))

  // Temba supports the GET, POST, PUT, PATCH, DELETE, and HEAD methods for resource URLs.
  // HEAD is not implemented here, because Express supports it out of the box.

  // Create a router on all other URLs, for all supported methods
  const resourcePath = config.apiPrefix ? `${config.apiPrefix}*` : '*'
  const schemas = compileSchemas(config.schemas)
  const resourceRouter = createResourceRouter(queries, schemas, config)
  app.use(resourcePath, resourceRouter)

  // A GET to the root URL shows a default message.
  rootRouter.get('/', async (_, res) => {
    return res.send('It works! ツ')
  })

  // All other requests to the root URL are not allowed.
  rootRouter.all('/', handleMethodNotAllowed)

  // In case of an API prefix, resource URLs outside of the API prefix return a 404 Not Found.
  if (config.apiPrefix) {
    app.get('*', handleNotFound)
    app.post('*', handleNotFound)
    app.put('*', handleNotFound)
    app.delete('*', handleNotFound)
    app.patch('*', handleNotFound)
  }

  // All other methods to any URL are not allowed.
  app.all('*', handleMethodNotAllowed)
  if (config.apiPrefix) app.all(`${config.apiPrefix}*`, handleMethodNotAllowed)

  return {
    start: () => {
      if (config.isTesting) {
        logger.info('⛔️ Server not started. Remove or disable isTesting from your config.')
        return
      }

      app.listen(config.port, () => {
        logger.info(`✅ Server listening on port ${config.port}`)
      })
    },
    // Expose Express for testing purposes only, e.g. usage with supertest.
    Express: config.isTesting ? app : undefined,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)

export const TembaError = TembaErrorInternal
