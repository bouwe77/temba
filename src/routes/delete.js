function createDeleteRoutes(queries) {
  return {
    handleDelete: async function handleDelete(req, res) {
      const { resourceName, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resourceName, id)
        if (item) {
          await queries.deleteById(resourceName, id)
        }
      } else {
        await queries.deleteAll(resourceName)
      }

      res.status(204).send()
    },
  }
}

export { createDeleteRoutes }
