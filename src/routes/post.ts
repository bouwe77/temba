import { format } from 'url'
import { validateRequestBody } from './validator'

function createPostRoutes(queries, requestBodyInterceptor) {
  async function handlePost(req, res) {
    try {
      const { resourceName } = req.requestInfo

      const requestBody = validateRequestBody(requestBodyInterceptor.post, req)

      if (typeof requestBody === 'string')
        return res.status(400).json({ message: requestBody }).send()

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
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handlePost,
  }
}

export { createPostRoutes }
