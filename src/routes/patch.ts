import { interceptRequestBody } from './interceptors'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import { ValidateFunctionPerResource } from '../schema/types'
import { ExtendedRequest, RequestBodyInterceptor } from './types'
import { Queries } from '../queries/types'
import { Response } from 'express'

function createPatchRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) {
  async function handlePatch(req: ExtendedRequest, res: Response) {
    try {
      const { resource, id } = req.requestInfo

      const validationResult = validate(req.body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return res.status(400).json({ message: validationResult.errorMessage })
      }

      const body = interceptRequestBody(requestBodyInterceptor.patch, req)

      if (typeof body === 'string') return res.status(400).json({ message: body }).send()

      let item = null
      if (id) item = await queries.getById(resource, id)

      if (!item)
        return res.status(404).json({
          message: `ID '${id}' not found`,
        })

      item = { ...item, ...body, id }

      const updatedItem = await queries.update(resource, item)

      return res
        .status(200)
        .json(returnNullFields ? updatedItem : removeNullFields(updatedItem))
        .send()
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handlePatch,
  }
}

export { createPatchRoutes }
