import express, { type Response, type Request } from 'express'
import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import { createUrlMiddleware } from '../urls/urlMiddleware'

import type { RouterConfig } from '../config'
import type { CompiledSchemas } from '../schema/types'
import type { Queries } from '../queries/types'
import type { ExtendedRequest, TembaResponse, TembaRequest } from './types'

export const createResourceRouter = (
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) => {
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

  const urlMiddleware = createUrlMiddleware(apiPrefix, validateResources, resources)

  const resourceRouter = express.Router()

  const createRequestHandler = (
    handleRequest: (tembaRequest: TembaRequest) => Promise<TembaResponse>,
  ) => {
    return async (req: ExtendedRequest, res: Response) => {
      const host = req.get('host') || null
      const protocol = host ? req.protocol : null
      const request = {
        requestInfo: req.requestInfo,
        body: req.body,
        protocol,
        host,
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
    // @ts-ignore
    .get('*', urlMiddleware, createRequestHandler(handleGet))
    // @ts-ignore
    .post('*', urlMiddleware, createRequestHandler(handlePost))
    // @ts-ignore
    .put('*', urlMiddleware, createRequestHandler(handlePut))
    // @ts-ignore
    .patch('*', urlMiddleware, createRequestHandler(handlePatch))
    // @ts-ignore
    .delete('*', urlMiddleware, createRequestHandler(handleDelete))

  return resourceRouter
}

// A GET to the root URL shows a default message.
export const rootRouter = express.Router()
rootRouter.get('/', async (_, res) => {
  return res.send('It works! ツ')
})

// Route for handling not allowed methods.
export const handleMethodNotAllowed = (_: Request, res: Response) => {
  res.status(405).json({ message: 'Method Not Allowed' })
}

// Route for handling not found.
export const handleNotFound = (_: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' })
}

// All other requests to the root URL are not allowed.
rootRouter.all('/', handleMethodNotAllowed)
