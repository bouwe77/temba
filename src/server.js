import express, { json } from 'express'

import { getResourceAndId } from './urls/middleware/getResourceAndId'
import { errorHandler } from './errors/middleware/errorHandler'
import { createValidateResourceMiddleware } from './urls/middleware/validateResource'
import { createRoutes } from './routes'
import { createQueries } from './queries'
import { initConfig } from './config'

function createServer(userConfig) {
  const config = initConfig(userConfig)

  const validateResource = createValidateResourceMiddleware(
    config.resourceNames,
  )

  const query = createQueries(config.connectionString)

  const app = express()
  app.use(json())

  // Routes
  const routes = createRoutes(query)

  // A GET to the root URL shows a default message.
  app.get('/', routes.handleGetDefaultPage)

  // All other requests to the root URL are not allowed.
  app.all('/', routes.handleMethodNotAllowed)

  // GET, POST, PUT and DELETE to a specific URL are handled.
  app.get('*', getResourceAndId, validateResource, routes.handleGetResource)
  app.post('*', getResourceAndId, validateResource, routes.handlePost)
  app.put('*', getResourceAndId, validateResource, routes.handlePut)
  app.delete('*', getResourceAndId, validateResource, routes.handleDelete)

  // All other methods to a specific URL are not allowed.
  app.all('*', routes.handleMethodNotAllowed)

  // Error middleware.
  app.use(errorHandler)

  return app
}

export function create(userConfig) {
  return createServer(userConfig)
}
