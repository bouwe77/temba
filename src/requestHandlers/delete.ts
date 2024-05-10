import type { Queries } from '../data/types'
import type { DeleteRequest } from './types'

export const createDeleteRoutes = (queries: Queries, allowDeleteCollection: boolean) => {
  const handleDelete = async (req: DeleteRequest) => {
    try {
      const { resource, id } = req

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
