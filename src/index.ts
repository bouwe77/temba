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
import { createAuthMiddleware, isAuthEnabled } from './auth/auth'

// Route for handling not allowed methods.
const handleMethodNotAllowed = (_: Request, res: Response) => {
  res.status(405).json({ message: 'Method Not Allowed' })
}

// Route for handling not found.
const handleNotFound = (_: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' })
}

const createServer = (userConfig?: UserConfig) => {
  const config = initConfig(userConfig)

  const queries = createQueries(config.connectionString)

  const app = express()
  app.use(json())

  // Add HTTP request logging.
  app.use(morgan('tiny'))

  // Enable CORS for all requests.
  app.use(cors({ origin: true, credentials: true }))

  // Serve a static folder, if configured.
  // Because it is defined before the auth middleware, the static folder is served without authentication,
  // because it is not convenient to add an auth header to a web page in the browser.
  if (config.staticFolder) {
    app.use(express.static(config.staticFolder))
  }

  // If enabled, add auth middleware to all requests, and disable the tokens resource.
  if (isAuthEnabled()) {
    app.use(createAuthMiddleware(queries))
    app.all('/tokens', handleNotFound)
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
        console.log('⛔️ Server not started. Remove or disable isTesting from your config.')
        return
      }

      app.listen(config.port, () => {
        console.log(`✅ Server listening on port ${config.port}`)
      })
    },
    // Expose Express for testing purposes only, e.g. usage with supertest.
    Express: config.isTesting ? app : undefined,
  }
}

export const create = (userConfig?: UserConfig) => createServer(userConfig)

export const TembaError = TembaErrorInternal
