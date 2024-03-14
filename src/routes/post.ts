import { format } from 'url'
import { interceptRequestBody } from './interceptRequestBody'
import { removeNullFields } from './utils'
import { validate } from '../schema/validate'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { TembaRequest, RequestBodyInterceptor } from './types'
import type { ItemWithoutId, Queries } from '../queries/types'

function createPostRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) {
  async function handlePost(req: TembaRequest) {
    try {
      const {
        body,
        protocol,
        host,
        requestInfo: { resource },
      } = req

      // This check is only to satisfy TypeScript.
      if (!resource) return { status: 404 }

      const validationResult = validate(body, schemas[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      const body2 = requestBodyInterceptor?.post
        ? interceptRequestBody(requestBodyInterceptor.post, resource, body)
        : body

      if (typeof body2 === 'string') return { status: 400, body: { message: body2 } }

      const newItem = await queries.create(resource, body2 as ItemWithoutId)

      return {
        headers: {
          Location: format({
            protocol: protocol,
            host: host,
            pathname: `${resource}/${newItem.id}`,
          }),
        },
        status: 201,
        body: returnNullFields ? newItem : removeNullFields(newItem),
      }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return {
    handlePost,
  }
}

export { createPostRoutes }
