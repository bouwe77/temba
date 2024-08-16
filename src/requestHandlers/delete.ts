import { TembaError } from '..'
import type { Queries } from '../data/types'
import { interceptDeleteRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import type { DeleteRequest } from './types'

export const createDeleteRoutes = (
  queries: Queries,
  allowDeleteCollection: boolean,
  requestInterceptor: RequestInterceptor | null,
) => {
  const handleDelete = async (req: DeleteRequest) => {
    try {
      const { headers, resource, id } = req

      if (requestInterceptor?.delete) {
        try {
          interceptDeleteRequest(requestInterceptor.delete, headers, resource, id)
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
          await queries.deleteById(resource, id)
        }
      } else {
        if (!allowDeleteCollection) {
          return { status: 405 }
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
