function createGetRoutes(queries, cacheControl, responseBodyInterceptor) {
  async function handleGetResource(req, res) {
    try {
      const { resourceName, id } = req.requestInfo

      res.set('Cache-control', cacheControl)

      if (id) {
        const item = await queries.getById(resourceName, id)

        if (!item) {
          res.status(404)
          return res.send()
        }

        let theItem = item
        if (responseBodyInterceptor) {
          try {
            theItem = responseBodyInterceptor({ resourceName, responseBody: item, id })
            if (!theItem) theItem = item
          } catch (error) {
            return res.status(500).json({
              message: 'Error in responseBodyInterceptor: ' + error.message,
            })
          }
        }

        res.status(200)
        res.json(theItem)
        return res.send()
      }

      const items = await queries.getAll(resourceName)

      let theItems = items
      if (responseBodyInterceptor) {
        try {
          theItems = responseBodyInterceptor({ resourceName, responseBody: items })
          if (!theItems) theItems = items
        } catch (error) {
          return res.status(500).json({
            message: 'Error in responseBodyInterceptor: ' + error.message,
          })
        }
      }

      res.status(200)
      res.json(theItems)
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
