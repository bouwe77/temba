import { interceptRequestBody } from './interceptRequestBody'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { RequestBodyInterceptor, TembaRequest } from './types'
import type { Queries } from '../queries/types'

function createPatchRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource | null,
) {
  async function handlePatch(req: TembaRequest) {
    try {
      const {
        body,
        requestInfo: { resource, id },
      } = req

      // This check is only to satisfy TypeScript.
      if (!resource) return { status: 404 }

      const validationResult = validate(body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      const body2 = requestBodyInterceptor?.patch
        ? interceptRequestBody(requestBodyInterceptor.patch, resource, body)
        : body

      if (typeof body2 === 'string') return { status: 400, body: { message: body2 } }

      // This check is only to satisfy TypeScript.
      if (!id) return { status: 404 }

      let item = await queries.getById(resource, id)

      if (!item)
        return {
          status: 404,
          body: {
            message: `ID '${id}' not found`,
          },
        }

      item = { ...item, ...(body2 as object), id }

      // TODO Update types for req.requestInfo: id should be a string when PUT, PATCH, and DELETE
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
