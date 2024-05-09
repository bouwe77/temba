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
  const { cacheControl, requestInterceptor, responseBodyInterceptor, returnNullFields } =
    routerConfig

  const handleGet = createGetRoutes(
    queries,
    cacheControl,
    responseBodyInterceptor,
    returnNullFields,
  )

  const handlePost = createPostRoutes(queries, requestInterceptor, returnNullFields, schemas.post)

  const handlePut = createPutRoutes(queries, requestInterceptor, returnNullFields, schemas.put)

  const handlePatch = createPatchRoutes(
    queries,
    requestInterceptor,
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
