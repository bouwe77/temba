function createGetRoutes(queries) {
  async function handleGetResource(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resourceName, id)

        if (!item) {
          res.status(404)
          return res.send()
        }

        res.status(200).json(item)
        return res.send()
      }

      const items = await queries.getAll(resourceName)
      res.status(200).json(items)
      return res.send()
    } catch (error) {
      return next(error)
    }
  }

  return {
    handleGetResource,
  }
}

export { createGetRoutes }
