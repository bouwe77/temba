import { new404NotFoundError } from '../errors/errors'
import { validateRequestBody } from './validator'

function createPatchRoutes(queries, requestBodyValidator) {
  async function handlePatch(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      const requestBody = validateRequestBody(requestBodyValidator.patch, req)

      if (typeof requestBody === 'string')
        return res.status(400).json({ message: requestBody }).send()

      let item = null
      if (id) item = await queries.getById(resourceName, id)

      // TODO return a response instead of calling next
      if (!item) return next(new404NotFoundError(`ID '${id}' not found`))

      item = { ...item, ...requestBody, id }

      const updatedItem = await queries.update(resourceName, item)

      return res.status(200).json(updatedItem).send()
    } catch (error: unknown) {
      return next(error)
    }
  }

  return {
    handlePatch,
  }
}

export { createPatchRoutes }
