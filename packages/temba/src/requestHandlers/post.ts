import { format } from 'url'
import type { ItemWithoutId, Queries } from '../data/types'
import { interceptPostRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ValidateFunctionPerResource } from '../schema/types'
import { validate } from '../schema/validate'
import type { BroadcastFunction } from '../websocket/websocket'
import type { PostRequest } from './types'
import { removeNullFields } from './utils'

export const createPostRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
  broadcast: BroadcastFunction | null,
) => {
  const handlePost = async (req: PostRequest) => {
    const { headers, protocol, host, resource, id, url } = req
    let { body } = req

    const validationResult = validate(body, schemas[resource])
    if (validationResult.isValid === false) {
      return { statusCode: 400, body: { message: validationResult.errorMessage } }
    }

    if (requestInterceptor?.post) {
      try {
        const interceptResult = await interceptPostRequest(
          requestInterceptor.post,
          headers,
          resource,
          id,
          body,
          url,
        )

        if (interceptResult.type === 'response') {
          return {
            statusCode: interceptResult.status,
            body: interceptResult.body,
          }
        }

        body = interceptResult.body ?? body
      } catch (error: unknown) {
        return {
          statusCode: 500,
          body: { message: (error as Error).message },
        }
      }
    }

    if (id) {
      const item = await queries.getById({ resource, id })

      if (item)
        return {
          statusCode: 409,
          body: {
            message: `ID '${id}' already exists`,
          },
        }
    }

    const newItem = await queries.create({ resource, id, item: body as ItemWithoutId })

    // Broadcast to WebSocket clients if enabled
    if (broadcast) {
      broadcast(resource, 'CREATE', newItem)
    }

    return {
      headers: {
        Location: format({
          protocol: protocol,
          host: host,
          pathname: `${resource}/${newItem.id}`,
        }),
      },
      statusCode: 201,
      body: returnNullFields ? newItem : removeNullFields(newItem),
    }
  }

  return handlePost
}
