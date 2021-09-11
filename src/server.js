import express, { json } from 'express'
import morgan from 'morgan'
import { errorHandler } from './errors/middleware'
import {
  createResourceRouter,
  rootRouter,
  handleMethodNotAllowed,
} from './routes'
import { createQueries } from './queries'
import { initConfig } from './config'

function createServer(userConfig) {
  const config = initConfig(userConfig)

  const queries = createQueries(config.connectionString)

  const app = express()
  app.use(json())
  app.use(morgan('tiny'))

  if (config.staticFolder) {
    app.use(express.static(config.staticFolder))
  }

  // Routes
  const rootPath = config.apiPrefix ? `${config.apiPrefix}` : '/'
  app.use(rootPath, rootRouter)

  // GET, POST, PUT and DELETE to a specific URL are handled.
  const resourceRouter = createResourceRouter(queries, config)
  const resourcePath = config.apiPrefix ? `${config.apiPrefix}*` : '*'
  app.use(resourcePath, resourceRouter)

  // All other methods to a specific URL are not allowed.
  app.all('*', handleMethodNotAllowed)
  if (config.apiPrefix) app.all(`${config.apiPrefix}*`, handleMethodNotAllowed)

  // Error middleware.
  app.use(errorHandler)

  return app
}

export function create(userConfig) {
  return createServer(userConfig)
}
