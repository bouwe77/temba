import express, { json } from 'express'
import morgan from 'morgan'
import { errorHandler } from './errors/middleware'
import { createResourceRouter } from './routes/resources/router'
import { createQueries } from './queries'
import { initConfig } from './config'
import { createRootRouter } from './routes/root/router'
import { handleMethodNotAllowed } from './routes/utils'

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
  const rootRouter = createRootRouter(queries)
  const rootPath = config.pathPrefix ? `${config.pathPrefix}` : '/'
  app.use(rootPath, rootRouter)

  // GET, POST, PUT and DELETE to a specific URL are handled.
  const resourceRouter = createResourceRouter(queries, config)
  const resourcePath = config.pathPrefix ? `${config.pathPrefix}*` : '*'
  app.use(resourcePath, resourceRouter)

  // All other methods to a specific URL are not allowed.
  app.all('*', handleMethodNotAllowed)
  if (config.pathPrefix)
    app.all(`${config.pathPrefix}*`, handleMethodNotAllowed)

  // Error middleware.
  app.use(errorHandler)

  return app
}

export function create(userConfig) {
  return createServer(userConfig)
}
