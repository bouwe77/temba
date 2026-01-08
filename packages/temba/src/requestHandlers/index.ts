import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import type { Config } from '../config'
import type { CompiledSchemas } from '../schema/types'
import type { Queries } from '../data/types'
import type { BroadcastFunction } from '../websocket/websocket'

// Wrapper to handle errors for all request handlers
const withErrorHandling = <TArgs extends unknown[], TReturn>(
  handler: (...args: TArgs) => Promise<TReturn>,
): ((...args: TArgs) => Promise<TReturn>) => {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (error: unknown) {
      return { statusCode: 500, body: { message: (error as Error).message } } as TReturn
    }
  }
}

export const getRequestHandler = async (
  queries: Queries,
  schemas: CompiledSchemas,
  config: Config,
  broadcast: BroadcastFunction | null,
) => {
  const {
    requestInterceptor,
    responseBodyInterceptor,
    returnNullFields,
    allowDeleteCollection,
    etagsEnabled,
  } = config

  const handleGet = withErrorHandling(
    createGetRoutes(
      queries,
      requestInterceptor,
      responseBodyInterceptor,
      returnNullFields,
      etagsEnabled,
    ),
  )

  const handlePost = withErrorHandling(
    createPostRoutes(queries, requestInterceptor, returnNullFields, schemas.post, broadcast),
  )

  const handlePut = withErrorHandling(
    createPutRoutes(
      queries,
      requestInterceptor,
      returnNullFields,
      schemas.put,
      etagsEnabled,
      broadcast,
    ),
  )

  const handlePatch = withErrorHandling(
    createPatchRoutes(
      queries,
      requestInterceptor,
      returnNullFields,
      schemas.patch,
      etagsEnabled,
      broadcast,
    ),
  )

  const handleDelete = withErrorHandling(
    createDeleteRoutes(
      queries,
      allowDeleteCollection,
      requestInterceptor,
      etagsEnabled,
      broadcast,
    ),
  )

  return {
    handleGet,
    handlePost,
    handlePut,
    handlePatch,
    handleDelete,
  }
}
