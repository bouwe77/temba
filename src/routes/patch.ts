import { interceptRequestBody } from './interceptRequestBody'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { RequestBodyInterceptor, TembaRequest } from './types'
import type { Queries } from '../queries/types'

function createPatchRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) {
  async function handlePatch(req: TembaRequest) {
    try {
      const { resource, id } = req.requestInfo

      const validationResult = validate(req.body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      const body = requestBodyInterceptor?.patch
        ? interceptRequestBody(requestBodyInterceptor.patch, resource, req.body)
        : req.body

      if (typeof body === 'string') return { status: 400, body: { message: body } }

      let item = null
      if (id) item = await queries.getById(resource, id)

      if (!item)
        return {
          status: 404,
          body: {
            message: `ID '${id}' not found`,
          },
        }

      item = { ...item, ...(body as object), id }

      const updatedItem = await queries.update(resource, item)

      return { status: 200, body: returnNullFields ? updatedItem : removeNullFields(updatedItem) }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return {
    handlePatch,
  }
}

export { createPatchRoutes }
