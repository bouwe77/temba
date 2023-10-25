function createDeleteRoutes(queries) {
  async function handleDelete(req, res) {
    try {
      const { resource, id } = req.requestInfo

      if (id) {
        const item = await queries.getById(resource, id)
        if (item) {
          await queries.deleteById(resource, id)
        }
      } else {
        await queries.deleteAll(resource)
      }
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }

    return res.status(204).send()
  }

  return {
    handleDelete,
  }
}

export { createDeleteRoutes }
