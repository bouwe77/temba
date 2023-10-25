import { format } from 'url'
import { interceptRequestBody } from './interceptors'
import { removeNullFields } from './utils'
import validate from './schemaValidation'

function createPostRoutes(queries, requestBodyInterceptor, returnNullFields, schemas) {
  async function handlePost(req, res) {
    try {
      const { resourceName } = req.requestInfo

      const schema = schemas[resourceName]?.post
      const isValid = schema ? validate(req.body, schema) : true
      if (!isValid) {
        return res.status(400).json({ message: 'AJV zegt nee' })
      }

      const requestBody = interceptRequestBody(requestBodyInterceptor.post, req)

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
