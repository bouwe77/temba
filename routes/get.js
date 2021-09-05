function createGetRoutes(query) {
  return {
    handleGetResource: async function handleGetResource(req, res) {
      const { resourceName, id } = req.requestInfo;

      if (id) {
        const item = await query.getById(resourceName, id);

        if (!item) res.status(404);
        else {
          res.status(200).json(item);
        }
      } else {
        const items = await query.getAll(resourceName);
        res.status(200).json(items);
      }

      res.send();
    },
    handleGetDefaultPage: function handleGetDefaultPage(_, res) {
      res.send("It works! (ツ)");
    },
  };
}

module.exports = { createGetRoutes };
