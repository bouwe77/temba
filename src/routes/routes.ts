import express, { Response } from 'express'
import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import { createValidateResourceMiddleware, createResourceAndIdParser } from '../urls/urlMiddleware'
import { RouterConfig } from '../config'
import { CompiledSchemas } from '../schema/types'
import { Queries } from '../queries/types'
import { ExtendedRequest, TembaResponse, TembaRequest } from './types'

function createResourceRouter(
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) {
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

  const { handlePost } = createPostRoutes(
    queries,
    requestBodyInterceptor,
    returnNullFields,
    schemas.post,
  )

  const { handlePut } = createPutRoutes(
    queries,
    requestBodyInterceptor,
    returnNullFields,
    schemas.put,
  )

  const { handlePatch } = createPatchRoutes(
    queries,
    requestBodyInterceptor,
    returnNullFields,
    schemas.patch,
  )

  const { handleDelete } = createDeleteRoutes(queries)

  const validateResource = createValidateResourceMiddleware(validateResources, resources)
  const getResourceAndId = createResourceAndIdParser(apiPrefix)

  const resourceRouter = express.Router()

  const createRequestHandler = (
    handleRequest: (tembaRequest: TembaRequest) => Promise<TembaResponse>,
  ) => {
    return async (req: ExtendedRequest, res: Response) => {
      const request = {
        requestInfo: req.requestInfo,
        body: req.body,
        protocol: req.protocol,
        host: req.get('host'),
      }

      const tembaResponse = await handleRequest(request)

      res.status(tembaResponse.status)

      if (tembaResponse.headers) {
        for (const [key, value] of Object.entries(tembaResponse.headers)) {
          res.set(key, value)
        }
      }

      res.json(tembaResponse.body)

      res.end()
    }
  }

  resourceRouter
    // The router.get() function automatically handles HEAD requests as well, unless router.head is called first.
    .get('*', getResourceAndId, validateResource, createRequestHandler(handleGet))
    .post('*', getResourceAndId, validateResource, createRequestHandler(handlePost))
    .put('*', getResourceAndId, validateResource, createRequestHandler(handlePut))
    .patch('*', getResourceAndId, validateResource, createRequestHandler(handlePatch))
    .delete('*', getResourceAndId, validateResource, createRequestHandler(handleDelete))

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
