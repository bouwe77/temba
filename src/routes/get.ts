import type { Item, Queries } from '../queries/types'
import type { ResponseBodyInterceptor, InterceptedResponse, TembaRequest } from './types'
import { removeNullFields } from './utils'

export const createGetRoutes = (
  queries: Queries,
  cacheControl: string,
  responseBodyInterceptor: ResponseBodyInterceptor | null,
  returnNullFields: boolean,
) => {
  const defaultResponse = { headers: { 'Cache-control': cacheControl } }
  const responseOk = (body: unknown) => ({ ...defaultResponse, status: 200, body })

  const intercept = (
    interceptor: ResponseBodyInterceptor,
    info: InterceptedResponse<Item | Item[]>,
  ) => {
    if (!interceptor) return info.body

    const intercepted = interceptor(info)

    return intercepted ? intercepted : info.body
  }

  const handleGet = async (req: TembaRequest) => {
    try {
      const {
        requestInfo: { resource, id },
      } = req

      if (id) {
        const item = await queries.getById(resource, id)

        if (!item) {
          return { ...defaultResponse, status: 404 }
        }

        const theItem = responseBodyInterceptor
          ? intercept(responseBodyInterceptor, { resource, body: item, id })
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
        ? intercept(responseBodyInterceptor, { resource, body: items })
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

  return {
    handleGet,
  }
}
