import { TembaError } from '..'
import type { Queries } from '../data/types'
import { etag } from '../etags/etags'
import { interceptDeleteRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { DeleteRequest } from './types'

export const createDeleteRoutes = (
  queries: Queries,
  allowDeleteCollection: boolean,
  requestInterceptor: RequestInterceptor | null,
  etags: boolean,
) => {
  const handleDelete = async (req: DeleteRequest) => {
    try {
      const { resource, id } = req

      if (requestInterceptor?.delete) {
        try {
          interceptDeleteRequest(requestInterceptor.delete, resource, id)
        } catch (error: unknown) {
          return {
            status: error instanceof TembaError ? error.statusCode : 500,
            body: { message: (error as Error).message },
          }
        }
      }

      if (id) {
        const item = await queries.getById(resource, id)
        if (item) {
          if (etags) {
            const itemEtag = etag(JSON.stringify(item))
            if (req.etag !== itemEtag) {
              return {
                status: 412,
                body: {
                  message: 'Precondition failed',
                },
              }
            }
          }

          await queries.deleteById(resource, id)
        } else {
          // Even when deleting a non existing item, we still need an etag.
          // The client needs to do a GET to determine it, after which it finds out the item is gone.
          if (etags && !req.etag) {
            return {
              status: 412,
              body: {
                message: 'Precondition failed',
              },
            }
          }
        }
      } else {
        if (!allowDeleteCollection) {
          return { status: 405 }
        }

        if (etags) {
          const items = await queries.getAll(resource)
          const etagValue = etag(JSON.stringify(items))
          if (req.etag !== etagValue) {
            return {
              status: 412,
              body: {
                message: 'Precondition failed',
              },
            }
          }
        }

        await queries.deleteAll(resource)
      }

      return { status: 204 }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return handleDelete
}
