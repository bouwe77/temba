import type { Config } from '../config'
import type { Queries } from '../data/types'
import type { Logger } from '../log/logger'
import type { CompiledSchemas } from '../schema/types'
import type { BroadcastFunction } from '../websocket/websocket'
import { createDeleteRoutes } from './delete'
import { createGetRoutes } from './get'
import { createPatchRoutes } from './patch'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'

// Wrapper to handle errors for all request handlers
const withErrorHandling = <TArgs extends unknown[], TReturn>(
  handler: (...args: TArgs) => Promise<TReturn>,
  log: Logger,
): ((...args: TArgs) => Promise<TReturn>) => {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (error: unknown) {
      const request = args[0]
      const requestInfo =
        request && typeof request === 'object' && 'resource' in request
          ? [
              'method' in request ? String(request.method).toUpperCase() : null,
              String(request.resource),
              'url' in request ? String(request.url) : null,
            ]
              .filter(Boolean)
              .join(' ')
          : ''

      log.error(`Error handling request${requestInfo ? ` ${requestInfo}` : ''}`)
      log.error(error)

      return { statusCode: 500, body: { message: (error as Error).message } } as TReturn
    }
  }
}

export const getRequestHandler = async (
  queries: Queries,
  schemas: CompiledSchemas,
  config: Config,
  broadcast: BroadcastFunction | null,
  log: Logger,
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
    log,
  )

  const handlePost = withErrorHandling(
    createPostRoutes(queries, requestInterceptor, returnNullFields, schemas.post, broadcast),
    log,
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
    log,
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
    log,
  )

  const handleDelete = withErrorHandling(
    createDeleteRoutes(queries, allowDeleteCollection, requestInterceptor, etagsEnabled, broadcast),
    log,
  )

  return {
    handleGet,
    handlePost,
    handlePut,
    handlePatch,
    handleDelete,
  }
}
