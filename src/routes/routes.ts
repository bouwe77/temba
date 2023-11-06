import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import { createValidateResourceMiddleware, createResourceAndIdParser } from '../urls/urlMiddleware'

import express from 'express'
import type { RouterConfig } from '../config'

function createResourceRouter(queries, routerConfig: RouterConfig) {
  const {
    validateResources,
    resources,
    apiPrefix,
    cacheControl,
    requestBodyInterceptor,
    responseBodyInterceptor,
    returnNullFields,
  } = routerConfig

  const { handleGet } = createGetRoutes(
    queries,
    cacheControl,
    responseBodyInterceptor,
    returnNullFields,
  )
  const { handlePost } = createPostRoutes(queries, requestBodyInterceptor, returnNullFields)
  const { handlePut } = createPutRoutes(queries, requestBodyInterceptor, returnNullFields)
  const { handlePatch } = createPatchRoutes(queries, requestBodyInterceptor, returnNullFields)
  const { handleDelete } = createDeleteRoutes(queries)

  const validateResource = createValidateResourceMiddleware(validateResources, resources)
  const getResourceAndId = createResourceAndIdParser(apiPrefix)

  const resourceRouter = express.Router()

  resourceRouter
    // The router.get() function automatically handles HEAD requests as well, unless router.head is called first.
    .get('*', getResourceAndId, validateResource, handleGet)
    .post('*', getResourceAndId, validateResource, handlePost)
    .put('*', getResourceAndId, validateResource, handlePut)
    .patch('*', getResourceAndId, validateResource, handlePatch)
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

// Route for handling not found.
function handleNotFound(_, res) {
  res.status(404).json({ message: 'Not Found' })
}

export { createResourceRouter, rootRouter, handleMethodNotAllowed, handleNotFound }
