import { format } from 'url'
import { validateRequestBody } from './validator'

function createPostRoutes(queries, requestBodyValidator) {
  async function handlePost(req, res, next) {
    try {
      const { resourceName } = req.requestInfo

      const requestBody = validateRequestBody(
        requestBodyValidator.post,
        resourceName,
        req.body,
      )

      const newItem = await queries.create(resourceName, requestBody)

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
    } catch (error: unknown) {
      return next(error)
    }
  }

  return {
    handlePost,
  }
}

export { createPostRoutes }
