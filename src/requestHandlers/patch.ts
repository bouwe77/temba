import { interceptPatchRequest } from '../requestInterceptor/interceptRequest'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { PatchRequest } from './types'
import type { Queries } from '../data/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { TembaError } from '../requestInterceptor/TembaError'

export const createPatchRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource | null,
) => {
  const handlePatch = async (req: PatchRequest) => {
    try {
      const { body, resource, id } = req

      const validationResult = validate(body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      let body2 = body
      if (requestInterceptor?.patch) {
        try {
          body2 = interceptPatchRequest(requestInterceptor.patch, resource, id, body)
        } catch (error: unknown) {
          return {
            status: error instanceof TembaError ? error.statusCode : 500,
            body: { message: (error as Error).message },
          }
        }
      }

      let item = await queries.getById(resource, id)

      if (!item)
        return {
          status: 404,
          body: {
            message: `ID '${id}' not found`,
          },
        }

      item = { ...item, ...(body2 as object), id }

      const updatedItem = await queries.update(resource, item)

      return { status: 200, body: returnNullFields ? updatedItem : removeNullFields(updatedItem) }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return handlePatch
}
