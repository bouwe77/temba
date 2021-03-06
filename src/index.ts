import express, { json } from 'express'
import morgan from 'morgan'
import { errorHandler } from './errors/errors'
import {
  createResourceRouter,
  rootRouter,
  handleMethodNotAllowed,
  handleNotFound,
} from './routes/routes'
import { createQueries } from './queries/queries'
import { Config, initConfig } from './config'
import cors from 'cors'
import { createDelayMiddleware } from './delay/delayMiddleware'

function createServer(userConfig?: Config) {
  const config = initConfig(userConfig)

  const queries = createQueries(config.connectionString)

  const app = express()
  app.use(json())

  // Add HTTP request logging.
  app.use(morgan('tiny'))

  // Enable CORS for all requests.
  app.use(cors({ origin: true, credentials: true }))

  if (config.delay > 0) {
    const delayMiddleware = createDelayMiddleware(config.delay)
    app.use(delayMiddleware)
  }

  // Serve a static folder, if configured.
  if (config.staticFolder) {
    app.use(express.static(config.staticFolder))
  }

  // On the root URL (with apiPrefix if applicable) only a GET is allowed.
  const rootPath = config.apiPrefix ? `${config.apiPrefix}` : '/'
  app.use(rootPath, rootRouter)

  // For all other URLs, only GET, POST, PUT and DELETE are allowed and handled.
  const resourceRouter = createResourceRouter(queries, config)
  const resourcePath = config.apiPrefix ? `${config.apiPrefix}*` : '*'
  app.use(resourcePath, resourceRouter)

  // In case of an API prefix, GET, POST, PUT and DELETE requests to all other URLs return a 404 Not Found.
  if (config.apiPrefix) {
    app.get('*', handleNotFound)
    app.post('*', handleNotFound)
    app.put('*', handleNotFound)
    app.delete('*', handleNotFound)
  }

  // All other methods to any URL are not allowed.
  app.all('*', handleMethodNotAllowed)
  if (config.apiPrefix) app.all(`${config.apiPrefix}*`, handleMethodNotAllowed)

  // Error middleware.
  app.use(errorHandler)

  return app
}

export function create(userConfig?: Config) {
  return createServer(userConfig)
}
