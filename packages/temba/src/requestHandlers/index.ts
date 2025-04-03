import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createPatchRoutes } from './patch'
import { createDeleteRoutes } from './delete'
import type { Config } from '../config'
import { compileSchemas } from '../schema/compile'
import type { Logger } from '../log/logger'
import { createQueries } from '../data/queries'

export const getRequestHandler = (logger: Logger, config: Config) => {
  const {
    requestInterceptor,
    responseBodyInterceptor,
    returnNullFields,
    allowDeleteCollection,
    etagsEnabled,
    schemas,
    connectionString,
  } = config

  const queries = createQueries(connectionString, logger)

  const { post: postSchemas, put: putSchemas, patch: patchSchemas } = compileSchemas(schemas)

  const handleGet = createGetRoutes(
    queries,
    requestInterceptor,
    responseBodyInterceptor,
    returnNullFields,
    etagsEnabled,
  )

  const handlePost = createPostRoutes(queries, requestInterceptor, returnNullFields, postSchemas)

  const handlePut = createPutRoutes(
    queries,
    requestInterceptor,
    returnNullFields,
    putSchemas,
    etagsEnabled,
  )

  const handlePatch = createPatchRoutes(
    queries,
    requestInterceptor,
    returnNullFields,
    patchSchemas,
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
