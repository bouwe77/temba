import type { Item, Queries } from '../queries/types'
import type { ResponseBodyInterceptor, ResponseInfo, TembaRequest } from './types'
import { removeNullFields } from './utils'

function createGetRoutes(
  queries: Queries,
  cacheControl: string,
  responseBodyInterceptor: ResponseBodyInterceptor,
  returnNullFields: boolean,
) {
  const intercept = (interceptor: ResponseBodyInterceptor, info: ResponseInfo<Item | Item[]>) => {
    if (!interceptor) return info.body

    const intercepted = interceptor(info)

    return intercepted ? intercepted : info.body
  }

  async function handleGet(req: TembaRequest) {
    try {
      const { resource, id } = req.requestInfo

      const defaultResponse = { headers: { 'Cache-control': cacheControl } }

      if (id) {
        const item = await queries.getById(resource, id)

        if (!item) {
          return { ...defaultResponse, status: 404 }
        }

        const theItem = intercept(responseBodyInterceptor, { resource, body: item, id })

        let body = theItem
        if (!returnNullFields) {
          if (Array.isArray(theItem)) {
            body = theItem.map((item) => removeNullFields(item))
          } else if (typeof theItem === 'object') {
            body = removeNullFields(theItem)
          } else {
            body = theItem
          }
        }

        return { ...defaultResponse, status: 200, body }
      }

      const items = await queries.getAll(resource)

      const theItems = intercept(responseBodyInterceptor, { resource, body: items })

      let body = theItems
      if (!returnNullFields) {
        if (Array.isArray(theItems)) {
          body = theItems.map((item) => removeNullFields(item))
        } else if (typeof theItems === 'object') {
          body = removeNullFields(theItems)
        } else {
          body = theItems
        }
      }

      return { ...defaultResponse, status: 200, body }
    } catch (error: unknown) {
      return { status: 500, body: { message: (error as Error).message } }
    }
  }

  return {
    handleGet,
  }
}

export { createGetRoutes }
