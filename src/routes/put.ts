import { interceptRequestBody } from './interceptRequestBody'
import { validate } from '../schema/validate'
import { removeNullFields } from './utils'
import { ValidateFunctionPerResource } from '../schema/types'
import { RequestBodyInterceptor, TembaRequest } from './types'
import { Queries } from '../queries/types'

function createPutRoutes(
  queries: Queries,
  requestBodyInterceptor: RequestBodyInterceptor,
  returnNullFields: boolean,
  schemas: ValidateFunctionPerResource,
) {
  async function handlePut(req: TembaRequest) {
    try {
      const { resource, id } = req.requestInfo

      const validationResult = validate(req.body, schemas?.[resource])
      if (validationResult.isValid === false) {
        return { status: 400, body: { message: validationResult.errorMessage } }
      }

      const body = interceptRequestBody(requestBodyInterceptor.put, resource, req.body)

      if (typeof body === 'string') return { status: 400, body: { message: body } }

      let item = null
      if (id) item = await queries.getById(resource, id)

      if (!item)
        return {
          status: 404,
          body: {
            message: `ID '${id}' not found`,
          },
        }

      item = { ...(body as object), id }

      const replacedItem = await queries.replace(resource, item)

      return { status: 200, body: returnNullFields ? replacedItem : removeNullFields(replacedItem) }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return {
    handlePut,
  }
}

export { createPutRoutes }
