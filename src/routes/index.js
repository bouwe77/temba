import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createDeleteRoutes } from './delete'
import {
  createValidateResourceMiddleware,
  createResourceAndIdParser,
} from '../urls/middleware'

import express from 'express'

function createResourceRouter(
  queries,
  { validateResources, resourceNames, apiPrefix },
) {
  const { handleGetResource } = createGetRoutes(queries)
  const { handlePost } = createPostRoutes(queries)
  const { handlePut } = createPutRoutes(queries)
  const { handleDelete } = createDeleteRoutes(queries)

  const validateResource = createValidateResourceMiddleware(
    validateResources,
    resourceNames,
  )
  const getResourceAndId = createResourceAndIdParser(apiPrefix)

  var resourceRouter = express.Router()

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
function handleMethodNotAllowed(_, res) {
  res.status(405).json({ message: 'Method Not Allowed' })
}

export { createResourceRouter, rootRouter, handleMethodNotAllowed }
