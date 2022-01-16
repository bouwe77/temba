import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createDeleteRoutes } from './delete'
import {
  createValidateResourceMiddleware,
  createResourceAndIdParser,
} from '../urls/middleware'

import express, { Router, Request, Response } from 'express'
import { TembaConfig } from '../config/types'

function createResourceRouter(queries, config: TembaConfig): Router {
  const { validateResources, resourceNames, apiPrefix, cacheControl } = config

  const { handleGetResource } = createGetRoutes(queries, cacheControl)
  const { handlePost } = createPostRoutes(queries)
  const { handlePut } = createPutRoutes(queries)
  const { handleDelete } = createDeleteRoutes(queries)

  const validateResource = createValidateResourceMiddleware(
    validateResources,
    resourceNames,
  )
  const getResourceAndId = createResourceAndIdParser(apiPrefix)

  const resourceRouter = express.Router()

  resourceRouter
    .get('*', getResourceAndId, validateResource, handleGetResource)
    .post('*', getResourceAndId, validateResource, handlePost)
    .put('*', getResourceAndId, validateResource, handlePut)
    .delete('*', getResourceAndId, validateResource, handleDelete)

  return resourceRouter
}

// A GET to the root URL shows a default message.
const rootRouter = express.Router()
rootRouter.get('/', async (_, res) => {
  return res.send('It works! ツ')
})

// All other requests to the root URL are not allowed.
rootRouter.all('/', handleMethodNotAllowed)

// Route for handling not allowed methods.
function handleMethodNotAllowed(_: Request, res: Response): void {
  res.status(405).json({ message: 'Method Not Allowed' })
}

// Route for handling not found.
function handleNotFound(_: Request, res: Response): void {
  res.status(404).json({ message: 'Not Found' })
}

export {
  createResourceRouter,
  rootRouter,
  handleMethodNotAllowed,
  handleNotFound,
}
