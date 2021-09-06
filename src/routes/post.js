import { format } from "url";

function createPostRoutes(query) {
  return {
    handlePost: async function handlePost(req, res) {
      const { resourceName } = req.requestInfo;

      const newItem = await query.create(resourceName, req.body);

      res
        .set({
          Location: format({
            protocol: req.protocol,
            host: req.get("host"),
            pathname: `${resourceName}/${newItem.id}`,
          }),
        })
        .status(201)
        .json(newItem)
        .send();
    },
  };
}

export { createPostRoutes };
