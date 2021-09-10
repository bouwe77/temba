import express, { json } from 'express'
import morgan from 'morgan'
import { errorHandler } from './errors/middleware'
import {
  createValidateResourceMiddleware,
  createResourceAndIdParser,
} from './urls/middleware'
import { createRoutes } from './routes'
import createQueries from './queries'
import { initConfig } from './config'

function createServer(userConfig) {
  const config = initConfig(userConfig)

  const validateResource = createValidateResourceMiddleware(
    config.validateResources,
    config.resourceNames,
  )
  const getResourceAndId = createResourceAndIdParser(config.pathPrefix)

  const queries = createQueries(config.connectionString)

  const app = express()
  app.use(json())
  app.use(morgan('tiny'))

  if (config.staticFolder) {
    app.use(express.static(config.staticFolder))
  }

  // Routes
  const routes = createRoutes(queries)

  // A GET to the root URL shows a default message.
  app.get('/' + config.pathPrefix, routes.handleGetDefaultPage)

  // All other requests to the root URL are not allowed.
  app.all('/', routes.handleMethodNotAllowed)
  if (config.pathPrefix)
    app.all(config.pathPrefix, routes.handleMethodNotAllowed)

  // GET, POST, PUT and DELETE to a specific URL are handled.
  app
    .route(config.pathPrefix + '*')
    .get(getResourceAndId, validateResource, routes.handleGetResource)
    .post(getResourceAndId, validateResource, routes.handlePost)
    .put(getResourceAndId, validateResource, routes.handlePut)
    .delete(getResourceAndId, validateResource, routes.handleDelete)

  // All other methods to a specific URL are not allowed.
  app.all('*', routes.handleMethodNotAllowed)
  if (config.pathPrefix) app.all('*', routes.handleMethodNotAllowed)

  // Error middleware.
  app.use(errorHandler)

  return app
}

export function create(userConfig) {
  return createServer(userConfig)
}
