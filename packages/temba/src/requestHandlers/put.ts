import { interceptPutRequest } from '../requestInterceptor/interceptRequest'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { PutRequest } from './types'
import type { Queries } from '../data/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { TembaError } from '../requestInterceptor/TembaError'
import { etag } from '../etags/etags'

export const createPutRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource | null,
  etagsEnabled: boolean,
) => {
  const handlePut = async (req: PutRequest) => {
    try {
      const { headers, body, resource, id } = req

      const validationResult = validate(body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { statusCode: 400, body: { message: validationResult.errorMessage } }
      }

      let body2 = body
      if (requestInterceptor?.put) {
        try {
          body2 = await interceptPutRequest(requestInterceptor.put, headers, resource, id, body)
        } catch (error: unknown) {
          return {
            statusCode: error instanceof TembaError ? error.statusCode : 500,
            body: { message: (error as Error).message },
          }
        }
      }

      let item = await queries.getById(resource, id)

      if (!item)
        return {
          statusCode: 404,
          body: {
            message: `ID '${id}' not found`,
          },
        }

      if (etagsEnabled) {
        const itemEtag = etag(JSON.stringify(item))
        if (req.etag !== itemEtag) {
          return {
            statusCode: 412,
            body: {
              message: 'Precondition failed',
            },
          }
        }
      }

      item = { ...(body2 as object), id }

      const replacedItem = await queries.replace(resource, item)

      return {
        statusCode: 200,
        body: returnNullFields ? replacedItem : removeNullFields(replacedItem),
      }
    } catch (error: unknown) {
      return { statusCode: 500, body: { message: (error as Error).message } }
    }
  }

  return handlePut
}
