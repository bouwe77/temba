import { format } from 'url'
import { interceptRequestBody } from '../requestBodyInterceptor/interceptRequestBody'
import { removeNullFields } from './utils'
import { validate } from '../schema/validate'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { PostRequest } from './types'
import type { ItemWithoutId, Queries } from '../data/types'
import type { RequestBodyInterceptor } from '../requestBodyInterceptor/types'

export const createPostRoutes = (
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) => {
  const handlePost = async (req: PostRequest) => {
    try {
      const { body, protocol, host, resource } = req

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

  return handlePost
}
