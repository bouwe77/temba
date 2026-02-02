import type { Queries } from '../data/types'
import { generateEtag } from '../etags/etags'
import { interceptGetRequest } from '../requestInterceptor/interceptRequest'
import type { RequestInterceptor } from '../requestInterceptor/types'
import { interceptResponseBody } from '../responseBodyInterceptor/interceptResponseBody'
import type { ResponseBodyInterceptor } from '../responseBodyInterceptor/types'
import type { Body, GetRequest } from './types'
import { removeNullFields } from './utils'

export const createGetRoutes = (
  queries: Queries,
  requestInterceptor: RequestInterceptor | null,
  responseBodyInterceptor: ResponseBodyInterceptor | null,
  returnNullFields: boolean,
  etagsEnabled: boolean,
) => {
  const handleGet = async (req: GetRequest) => {
    const { headers, resource, id, ifNoneMatchEtag, method, filter } = req

    const responseOk = (body: Body) => {
      if (!etagsEnabled) return { statusCode: 200, body }

      const etag = generateEtag(body)
      return ifNoneMatchEtag === etag
        ? { statusCode: 304, headers: { etag } }
        : { statusCode: 200, body, headers: { etag } }
    }

    if (method === 'get' && requestInterceptor?.get) {
      try {
        const interceptResult = await interceptGetRequest(
          requestInterceptor.get,
          headers,
          resource,
          id,
        )

        // If interceptor returned a response action, return immediately
        if (interceptResult.type === 'response') {
          return {
            statusCode: interceptResult.status,
            body: interceptResult.body,
          }
        }
      } catch (error: unknown) {
        return {
          statusCode: 500,
          body: { message: (error as Error).message },
        }
      }
    }

    if (id) {
      const item = await queries.getById({ resource, id })

      if (!item) {
        return { statusCode: 404 }
      }

      const theItem = responseBodyInterceptor
        ? await interceptResponseBody(responseBodyInterceptor, { resource, body: item, id })
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

    const items = filter
      ? await queries.getByFilter({ resource, filter })
      : await queries.getAll({ resource })

    const theItems = responseBodyInterceptor
      ? await interceptResponseBody(responseBodyInterceptor, { resource, body: items })
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
  }

  return handleGet
}
