import type { Queries } from '../queries/types'
import type { TembaRequest } from './types'

function createDeleteRoutes(queries: Queries) {
  async function handleDelete(req: TembaRequest) {
    try {
      const { resource, id } = req.requestInfo

      // This check is only to satisfy TypeScript.
      if (!resource) return { status: 404 }

      if (id) {
        const item = await queries.getById(resource, id)
        if (item) {
          await queries.deleteById(resource, id)
        }
      } else {
        await queries.deleteAll(resource)
      }

      return { status: 204 }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return {
    handleDelete,
  }
}

export { createDeleteRoutes }
