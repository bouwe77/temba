function createGetRoutes(queries) {
  return {
    handleGetResource: async function handleGetResource(req, res) {
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

      res.send()
    },
    handleGetDefaultPage: async function handleGetDefaultPage(_, res) {
      try {
        await queries.connectToDatabase()
      } catch (error) {
        return res.send('Could not connect to DB: ' + error.message)
      }

      res.send('It works! ツ')
    },
  }
}

export { createGetRoutes }
