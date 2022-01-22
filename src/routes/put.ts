import { new404NotFoundError } from '../errors'
import { validateRequestBody } from './validator'

function createPutRoutes(queries, requestBodyValidator) {
  async function handlePut(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      const requestBody = validateRequestBody(
        requestBodyValidator.put,
        resourceName,
        req.body,
      )

      let item = null
      if (id) item = await queries.getById(resourceName, id)

      if (!item) return next(new404NotFoundError(`ID '${id}' not found`))

      item = { ...requestBody, id }

      const updatedItem = await queries.update(resourceName, item)

      return res.status(200).json(updatedItem).send()
    } catch (error) {
      return next(error)
    }
  }

  return {
    handlePut,
  }
}

export { createPutRoutes }
