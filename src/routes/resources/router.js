import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createDeleteRoutes } from './delete'
import {
  createValidateResourceMiddleware,
  createResourceAndIdParser,
} from '../../urls/middleware'

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

export { createResourceRouter }
