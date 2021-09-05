function createDeleteRoutes(query) {
  return {
    handleDelete: async function handleDelete(req, res) {
      const { resourceName, id } = req.requestInfo;

      if (id) {
        const item = await query.getById(resourceName, id);
        if (item) {
          await query.deleteById(resourceName, id);
        }
      } else {
        await query.deleteAll(resourceName);
      }

      res.status(204).send();
    },
  };
}

export default { createDeleteRoutes };
