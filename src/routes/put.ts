import { interceptRequestBody } from './interceptors'
import { removeNullFields } from './utils'

function createPutRoutes(queries, requestBodyInterceptor, returnNullFields) {
  async function handlePut(req, res) {
    try {
      const { resource, id } = req.requestInfo

      const body = interceptRequestBody(requestBodyInterceptor.put, req)

      if (typeof body === 'string') return res.status(400).json({ message: body }).send()

      let item = null
      if (id) item = await queries.getById(resource, id)

      if (!item)
        return res.status(404).json({
          message: `ID '${id}' not found`,
        })

      item = { ...body, id }

      const replacedItem = await queries.replace(resource, item)

      return res
        .status(200)
        .json(returnNullFields ? replacedItem : removeNullFields(replacedItem))
        .send()
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handlePut,
  }
}

export { createPutRoutes }
