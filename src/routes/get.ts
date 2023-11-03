import { Response } from 'express'
import { Queries } from '../queries/types'
import { ExtendedRequest, ResponseBodyInterceptor } from './types'
import { removeNullFields } from './utils'

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

        let theItem = item
        if (responseBodyInterceptor) {
          try {
            // TODO fix interceptor types:
            // The interceptor type says it returns unknown, which is correct,
            // because users can return anything they want.
            // The question is: Do we want to removeNullFields from an intercepted item?
            // the answer is yes, if only if you look at how I use it in House.

            // ✅ So let's change the argument type of removeNullFields to unknown,
            // and inside removeNullFields, we'll check if the argument is an object,
            // and only then remove null fields....

            // I need my own interception function for this, because now I just call whatever is configured...

            theItem = responseBodyInterceptor({ resource, body: item, id })
            if (!theItem) theItem = item
          } catch (error) {
            return res.status(500).json({
              message: 'Error in responseBodyInterceptor: ' + error.message,
            })
          }
        }

        res.status(200)
        res.json(returnNullFields ? theItem : removeNullFields(theItem))
        return res.send()
      }

      const items = await queries.getAll(resource)

      let theItems = items
      if (responseBodyInterceptor) {
        try {
          theItems = responseBodyInterceptor({ resource, body: items })
          if (!theItems) theItems = items
        } catch (error) {
          return res.status(500).json({
            message: 'Error in responseBodyInterceptor: ' + error.message,
          })
        }
      }

      res.status(200)
      res.json(returnNullFields ? theItems : theItems.map((item) => removeNullFields(item)))
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
