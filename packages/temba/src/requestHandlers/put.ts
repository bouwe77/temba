import type { Queries } from '../data/types'
import { etag } from '../etags/etags'
import { interceptPutRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { ValidateFunctionPerResource } from '../schema/types'
import { validate } from '../schema/validate'
import type { BroadcastFunction } from '../websocket/websocket'
import type { PutRequest } from './types'
import { removeNullFields } from './utils'

export const createPutRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource | null,
  etagsEnabled: boolean,
  broadcast: BroadcastFunction | null,
) => {
  const handlePut = async (req: PutRequest) => {
    const { headers, resource, id, url } = req
    let { body } = req

    const validationResult = validate(body, schemas?.[resource])
    if (validationResult.isValid === false) {
      return { statusCode: 400, body: { message: validationResult.errorMessage } }
    }

    if (requestInterceptor?.put) {
      try {
        const interceptResult = await interceptPutRequest(
          requestInterceptor.put,
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

    let item = await queries.getById({ resource, id })

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

    item = { ...(body as object), id }

    const replacedItem = await queries.replace({ resource, item })

    // Broadcast to WebSocket clients if enabled
    if (broadcast) {
      broadcast(resource, 'UPDATE', replacedItem)
    }

    return {
      statusCode: 200,
      body: returnNullFields ? replacedItem : removeNullFields(replacedItem),
    }
  }

  return handlePut
}
