import { validateRequestBody } from './validator'

function createPatchRoutes(queries, requestBodyValidator) {
  async function handlePatch(req, res) {
    try {
      const { resourceName, id } = req.requestInfo

      const requestBody = validateRequestBody(requestBodyValidator.patch, req)

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

      return res.status(200).json(updatedItem).send()
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handlePatch,
  }
}

export { createPatchRoutes }
