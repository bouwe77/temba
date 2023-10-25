import { interceptRequestBody } from './interceptors'
import { removeNullFields } from './utils'

function createPatchRoutes(queries, requestBodyInterceptor, returnNullFields) {
  async function handlePatch(req, res) {
    try {
      const { resource, id } = req.requestInfo

      const body = interceptRequestBody(requestBodyInterceptor.patch, req)

      if (typeof body === 'string') return res.status(400).json({ message: body }).send()

      let item = null
      if (id) item = await queries.getById(resource, id)

      if (!item)
        return res.status(404).json({
          message: `ID '${id}' not found`,
        })

      item = { ...item, ...body, id }

      const updatedItem = await queries.update(resource, item)

      return res
        .status(200)
        .json(returnNullFields ? updatedItem : removeNullFields(updatedItem))
        .send()
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handlePatch,
  }
}

export { createPatchRoutes }
