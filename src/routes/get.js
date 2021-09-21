function createGetRoutes(queries, cacheControl) {
  async function handleGetResource(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resourceName, id)

        if (!item) {
          res.status(404)
          res.set('Cache-control', cacheControl)
          return res.send()
        }

        res.status(200)
        res.set('Cache-control', cacheControl)
        res.json(item)
        return res.send()
      }

      const items = await queries.getAll(resourceName)
      res.status(200)
      res.set('Cache-control', cacheControl)
      res.json(items)
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
