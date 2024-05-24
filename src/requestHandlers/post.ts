import { format } from 'url'
import { interceptPostRequest } from '../requestInterceptor/interceptRequest'
import { removeNullFields } from './utils'
import { validate } from '../schema/validate'
import type { ValidateFunctionPerResource } from '../schema/types'
import type { PostRequest } from './types'
import type { ItemWithoutId, Queries } from '../data/types'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { TembaError } from '../requestInterceptor/TembaError'

export const createPostRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
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

      let body2 = body
      if (requestInterceptor?.post) {
        try {
          body2 = interceptPostRequest(requestInterceptor.post, resource, body)
        } catch (error: unknown) {
          return {
            status: error instanceof TembaError ? error.statusCode : 500,
            body: { message: (error as Error).message },
          }
        }
      }

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
