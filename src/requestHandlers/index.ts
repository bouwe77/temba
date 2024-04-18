import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'

import type { RouterConfig } from '../config'
import type { CompiledSchemas } from '../schema/types'
import type { Queries } from '../data/types'

export const getRequestHandler = (
  queries: Queries,
  schemas: CompiledSchemas,
  routerConfig: RouterConfig,
) => {
  const { cacheControl, requestBodyInterceptor, responseBodyInterceptor, returnNullFields } =
    routerConfig

  const handleGet = createGetRoutes(
    queries,
    cacheControl,
    responseBodyInterceptor,
    returnNullFields,
  )

  const handlePost = createPostRoutes(
    queries,
    requestBodyInterceptor,
    returnNullFields,
    schemas.post,
  )

  const handlePut = createPutRoutes(queries, requestBodyInterceptor, returnNullFields, schemas.put)

  const handlePatch = createPatchRoutes(
    queries,
    requestBodyInterceptor,
    returnNullFields,
    schemas.patch,
  )

  const handleDelete = createDeleteRoutes(queries)

  return {
    handleGet,
    handlePost,
    handlePut,
    handlePatch,
    handleDelete,
  }
}
