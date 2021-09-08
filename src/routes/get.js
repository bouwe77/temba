function createGetRoutes(queries) {
  async function handleGetResource(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resourceName, id)

        if (!item) res.status(404)
        else {
          res.status(200).json(item)
        }
      } else {
        const items = await queries.getAll(resourceName)
        res.status(200).json(items)
      }
    } catch (error) {
      return next(error)
    }

    return res.send()
  }

  async function handleGetDefaultPage(_, res) {
    try {
      await queries.connectToDatabase()
    } catch (error) {
      return res.send('Could not connect to DB: ' + error.message)
    }

    return res.send('It works! ツ')
  }

  return {
    handleGetResource,
    handleGetDefaultPage,
  }
}

export { createGetRoutes }
