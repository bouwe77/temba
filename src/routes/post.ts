import { format } from 'url'
import { interceptRequestBody } from './interceptors'
import { removeNullFields } from './utils'

function createPostRoutes(queries, requestBodyInterceptor, returnNullFields) {
  async function handlePost(req, res) {
    try {
      const { resource } = req.requestInfo

      const body = interceptRequestBody(requestBodyInterceptor.post, req)

      if (typeof body === 'string') return res.status(400).json({ message: body }).send()

      const newItem = await queries.create(resource, body)

      return res
        .set({
          Location: format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: `${resource}/${newItem.id}`,
          }),
        })
        .status(201)
        .json(returnNullFields ? newItem : removeNullFields(newItem))
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
