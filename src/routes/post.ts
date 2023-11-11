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
  schemas: ValidateFunctionPerResource | null,
) {
  async function handlePost(req: TembaRequest) {
    try {
      const { resource } = req.requestInfo

      const validationResult = validate(req.body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      const body = requestBodyInterceptor?.post
        ? interceptRequestBody(requestBodyInterceptor.post, resource, req.body)
        : req.body

      if (typeof body === 'string') return { status: 400, body: { message: body } }

      const newItem = await queries.create(resource, body as ItemWithoutId)

      return {
        headers: {
          Location: format({
            protocol: req.protocol,
            host: req.host,
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
