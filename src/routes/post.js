import { format } from 'url'

function createPostRoutes(queries) {
  return {
    handlePost: async function handlePost(req, res) {
      const { resourceName } = req.requestInfo

      const newItem = await queries.create(resourceName, req.body)

      res
        .set({
          Location: format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: `${resourceName}/${newItem.id}`,
          }),
        })
        .status(201)
        .json(newItem)
        .send()
    },
  }
}

export { createPostRoutes }
