import { removeNullFields } from './utils'

function createGetRoutes(queries, cacheControl, responseBodyInterceptor, returnNullFields) {
  async function handleGetResource(req, res) {
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
    handleGetResource,
  }
}

export { createGetRoutes }
