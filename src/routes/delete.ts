function createDeleteRoutes(queries) {
  async function handleDelete(req, res, next) {
    try {
      const { resourceName, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resourceName, id)
        if (item) {
          await queries.deleteById(resourceName, id)
        }
      } else {
        await queries.deleteAll(resourceName)
      }
    } catch (error: unknown) {
      return next(error)
    }

    return res.status(204).send()
  }

  return {
    handleDelete,
  }
}

export { createDeleteRoutes }
