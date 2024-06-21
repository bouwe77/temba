import { interceptPutRequest } from '../requestInterceptor/interceptRequest'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { PutRequest } from './types'
import type { Queries } from '../data/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { TembaError } from '../requestInterceptor/TembaError'

export const createPutRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource | null,
) => {
  const handlePut = async (req: PutRequest) => {
    try {
      const { body, resource, id } = req

      const validationResult = validate(body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      let body2 = body
      if (requestInterceptor?.put) {
        try {
          body2 = interceptPutRequest(requestInterceptor.put, resource, id, body)
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

      item = { ...(body2 as object), id }

      const replacedItem = await queries.replace(resource, item)

      return { status: 200, body: returnNullFields ? replacedItem : removeNullFields(replacedItem) }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return handlePut
}
