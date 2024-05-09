import type { Queries } from '../data/types'
import { interceptResponseBody } from '../responseBodyInterceptor/interceptResponseBody'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { GetRequest } from './types'
import { removeNullFields } from './utils'

export const createGetRoutes = (
  queries: Queries,
  cacheControl: string,
  responseBodyInterceptor: ResponseBodyInterceptor | null,
  returnNullFields: boolean,
) => {
  const defaultResponse = { headers: { 'Cache-control': cacheControl } }
  const responseOk = (body: unknown) => ({ ...defaultResponse, status: 200, body })

  const handleGet = async (req: GetRequest) => {
    try {
      const { resource, id } = req

      if (id) {
        const item = await queries.getById(resource, id)

        if (!item) {
          return { ...defaultResponse, status: 404 }
        }

        const theItem = responseBodyInterceptor
          ? interceptResponseBody(responseBodyInterceptor, { resource, body: item, id })
          : item

        if (!returnNullFields) {
          if (Array.isArray(theItem)) {
            return responseOk(theItem.map((item) => removeNullFields(item)))
          }

          if (typeof theItem === 'object') {
            return responseOk(removeNullFields(theItem))
          }
        }

        return responseOk(theItem)
      }

      const items = await queries.getAll(resource)

      const theItems = responseBodyInterceptor
        ? interceptResponseBody(responseBodyInterceptor, { resource, body: items })
        : items

      if (!returnNullFields) {
        if (Array.isArray(theItems)) {
          return responseOk(theItems.map((item) => removeNullFields(item)))
        }

        if (typeof theItems === 'object') {
          return responseOk(removeNullFields(theItems))
        }
      }

      return responseOk(theItems)
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return handleGet
}
