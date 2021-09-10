import { new404NotFoundError } from '../../errors'

function createPutRoutes(queries) {
  async function handlePut(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      let item = null
      if (id) item = await queries.getById(resourceName, id)

      if (!item) return next(new404NotFoundError(`ID '${id}' not found`))

      item = { ...req.body, id }

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
