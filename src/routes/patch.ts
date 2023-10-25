import { interceptRequestBody } from './interceptors'
import validate from './schemaValidation'
import { removeNullFields } from './utils'

function createPatchRoutes(queries, requestBodyInterceptor, returnNullFields, schemas) {
  async function handlePatch(req, res) {
    try {
      const { resourceName, id } = req.requestInfo

      const schema = schemas[resourceName]?.patch
      const isValid = schema ? validate(req.body, schema) : true
      if (!isValid) {
        return res.status(400).json({ message: 'AJV zegt nee' })
      }

      const requestBody = interceptRequestBody(requestBodyInterceptor.patch, req)

      if (typeof requestBody === 'string')
        return res.status(400).json({ message: requestBody }).send()

      let item = null
      if (id) item = await queries.getById(resourceName, id)

      if (!item)
        return res.status(404).json({
          message: `ID '${id}' not found`,
        })

      item = { ...item, ...requestBody, id }

      const updatedItem = await queries.update(resourceName, item)

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
