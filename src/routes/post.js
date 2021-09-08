import { format } from 'url'

function createPostRoutes(queries) {
  async function handlePost(req, res, next) {
    try {
      const { resourceName } = req.requestInfo

      const newItem = await queries.create(resourceName, req.body)

      return res
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
    } catch (error) {
      return next(error)
    }
  }

  return {
    handlePost,
  }
}

export { createPostRoutes }
