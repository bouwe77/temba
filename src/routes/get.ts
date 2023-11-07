import { Response } from 'express'
import { Item, Queries } from '../queries/types'
import { ExtendedRequest, ResponseBodyInterceptor, ResponseInfo } from './types'
import { removeNullFields } from './utils'

const intercept = (interceptor: ResponseBodyInterceptor, info: ResponseInfo<Item | Item[]>) => {
  if (!interceptor) return info.body

  const intercepted = interceptor(info)

  return intercepted ? intercepted : info.body
}

function createGetRoutes(
  queries: Queries,
  cacheControl: string,
  responseBodyInterceptor: ResponseBodyInterceptor,
  returnNullFields: boolean,
) {
  async function handleGet(req: ExtendedRequest, res: Response) {
    try {
      const { resource, id } = req.requestInfo

      res.set('Cache-control', cacheControl)

      if (id) {
        const item = await queries.getById(resource, id)

        if (!item) {
          res.status(404)
          return res.send()
        }

        const theItem = intercept(responseBodyInterceptor, { resource, body: item, id })

        res.status(200)

        if (returnNullFields) {
          res.json(theItem)
        } else {
          if (Array.isArray(theItem)) {
            res.json(theItem.map((item) => removeNullFields(item)))
          } else if (typeof theItem === 'object') {
            res.json(removeNullFields(theItem))
          } else {
            res.json(theItem)
          }
        }

        return res.send()
      }

      const items = await queries.getAll(resource)

      const theItems = intercept(responseBodyInterceptor, { resource, body: items })

      res.status(200)

      if (returnNullFields) {
        res.json(theItems)
      } else {
        if (Array.isArray(theItems)) {
          res.json(theItems.map((item) => removeNullFields(item)))
        } else if (typeof theItems === 'object') {
          res.json(removeNullFields(theItems))
        } else {
          res.json(theItems)
        }
      }

      return res.send()
    } catch (error: unknown) {
      return res.status(500).json({ message: (error as Error).message })
    }
  }

  return {
    handleGet,
  }
}

export { createGetRoutes }
