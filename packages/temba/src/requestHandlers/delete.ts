import type { Queries } from '../data/types'
import { etag } from '../etags/etags'
import { interceptDeleteRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { BroadcastFunction } from '../websocket/websocket'
import type { DeleteRequest } from './types'

export const createDeleteRoutes = (
  queries: Queries,
  allowDeleteCollection: boolean,
  requestInterceptor: RequestInterceptor | null,
  etagsEnabled: boolean,
  broadcast: BroadcastFunction | null,
) => {
  const handleDelete = async (req: DeleteRequest) => {
    const { headers, resource, id, filter } = req

    if (filter === 'invalid') return { statusCode: 400, body: { message: 'Malformed filter expression' } }
    if (id && filter) return { statusCode: 400, body: { message: 'Filtering on a resource by ID is not supported' } }

    if (requestInterceptor?.delete) {
      try {
        const interceptResult = await interceptDeleteRequest(
          requestInterceptor.delete,
          headers,
          resource,
          id,
        )

        // If interceptor returned a response action, return immediately
        if (interceptResult.type === 'response') {
          return {
            statusCode: interceptResult.status,
            body: interceptResult.body,
          }
        }
      } catch (error: unknown) {
        return {
          statusCode: 500,
          body: { message: (error as Error).message },
        }
      }
    }

    if (id) {
      const item = await queries.getById({ resource, id })
      if (item) {
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

        await queries.deleteById({ resource, id })

        // Broadcast to WebSocket clients if enabled
        if (broadcast) {
          broadcast(resource, 'DELETE', { id })
        }
      } else {
        // Even when deleting a non existing item, we still need an etag.
        // The client needs to do a GET to determine it, after which it finds out the item is gone.
        if (etagsEnabled && !req.etag) {
          return {
            statusCode: 412,
            body: {
              message: 'Precondition failed',
            },
          }
        }
      }
    } else {
      if (!allowDeleteCollection) {
        return { statusCode: 405 }
      }

      if (etagsEnabled) {
        const items = await queries.getAll({ resource })
        const etagValue = etag(JSON.stringify(items))
        if (req.etag !== etagValue) {
          return {
            statusCode: 412,
            body: {
              message: 'Precondition failed',
            },
          }
        }
      }

      if (filter) {
        await queries.deleteByFilter({ resource, filter })
      } else {
        await queries.deleteAll({ resource })
      }

      // Broadcast to WebSocket clients if enabled
      if (broadcast) {
        broadcast(resource, 'DELETE_ALL')
      }
    }

    return { statusCode: 204 }
  }

  return handleDelete
}
