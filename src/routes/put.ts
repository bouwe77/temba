import { interceptRequestBody } from './interceptors'
import validate from './schemaValidation'
import { removeNullFields } from './utils'

function createPutRoutes(queries, requestBodyInterceptor, returnNullFields, schemas) {
  async function handlePut(req, res) {
    try {
      const { resourceName, id } = req.requestInfo

      const schema = schemas[resourceName]?.put
      const isValid = schema ? validate(req.body, schema) : true
      if (!isValid) {
        return res.status(400).json({ message: 'AJV zegt nee' })
      }

      const requestBody = interceptRequestBody(requestBodyInterceptor.put, req)

      if (typeof requestBody === 'string')
        return res.status(400).json({ message: requestBody }).send()

      let item = null
      if (id) item = await queries.getById(resourceName, id)

      if (!item)
        return res.status(404).json({
          message: `ID '${id}' not found`,
        })

      item = { ...requestBody, id }

      const replacedItem = await queries.replace(resourceName, item)

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
