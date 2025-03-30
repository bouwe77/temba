import type { Queries } from '../data/types'
import { generateEtag } from '../etags/etags'
import { TembaError } from '../requestInterceptor/TembaError'
import { interceptGetRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { interceptResponseBody } from '../responseBodyInterceptor/interceptResponseBody'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { GetRequest } from './types'
import { removeNullFields } from './utils'

export const createGetRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  responseBodyInterceptor: ResponseBodyInterceptor | null,
  returnNullFields: boolean,
  etagsEnabled: boolean,
) => {
  const handleGet = async (req: GetRequest) => {
    const { headers, resource, id, ifNoneMatchEtag } = req

    const responseOk = (body: unknown) => {
      if (!etagsEnabled) return { status: 200, body }

      const etag = generateEtag(body)
      return ifNoneMatchEtag === etag
        ? { status: 304, headers: { etag } }
        : { status: 200, body, headers: { etag } }
    }

    try {
      if (req.method === 'get' && requestInterceptor?.get) {
        try {
          interceptGetRequest(requestInterceptor.get, headers, resource, id)
        } catch (error: unknown) {
          return {
            status: error instanceof TembaError ? error.statusCode : 500,
            body: { message: (error as Error).message },
          }
        }
      }

      if (id) {
        const item = await queries.getById(resource, id)

        if (!item) {
          return { status: 404 }
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
