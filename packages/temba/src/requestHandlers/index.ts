import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import type { Config } from '../config'
import type { CompiledSchemas } from '../schema/types'
import type { Queries } from '../data/types'

export const getRequestHandler = async (
  queries: Queries,
  schemas: CompiledSchemas,
  config: Config,
) => {
  const {
    requestInterceptor,
    responseBodyInterceptor,
    returnNullFields,
    allowDeleteCollection,
    etagsEnabled,
  } = config

  const handleGet = createGetRoutes(
    queries,
    requestInterceptor,
    responseBodyInterceptor,
    returnNullFields,
    etagsEnabled,
  )

  const handlePost = createPostRoutes(queries, requestInterceptor, returnNullFields, schemas.post)

  const handlePut = createPutRoutes(
    queries,
    requestInterceptor,
    returnNullFields,
    schemas.put,
    etagsEnabled,
  )

  const handlePatch = createPatchRoutes(
    queries,
    requestInterceptor,
    returnNullFields,
    schemas.patch,
    etagsEnabled,
  )

  const handleDelete = createDeleteRoutes(
    queries,
    allowDeleteCollection,
    requestInterceptor,
    etagsEnabled,
  )

  return {
    handleGet,
    handlePost,
    handlePut,
    handlePatch,
    handleDelete,
  }
}
