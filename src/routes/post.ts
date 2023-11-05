import { format } from 'url'
import { interceptRequestBody } from './interceptors'
import { removeNullFields } from './utils'
import { validate } from '../schema/validate'
import { ValidateFunctionPerResource } from '../schema/types'
import { ExtendedRequest, RequestBodyInterceptor } from './types'
import { Queries } from '../queries/types'
import { Response } from 'express'

function createPostRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) {
  async function handlePost(req: ExtendedRequest, res: Response) {
    try {
      const { resource } = req.requestInfo

      const validationResult = validate(req.body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return res.status(400).json({ message: validationResult.errorMessage })
      }

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
