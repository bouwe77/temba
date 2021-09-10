import express from 'express'
import { handleMethodNotAllowed } from '../utils'

function createRootRouter(queries) {
  var rootRouter = express.Router()

  // A GET to the root URL shows a default message.
  rootRouter.get('/', async (_, res) => {
    try {
      await queries.connectToDatabase()
    } catch (error) {
      return res.send('Could not connect to DB: ' + error.message)
    }

    return res.send('It works! ツ')
  })

  // All other requests to the root URL are not allowed.
  rootRouter.all('/', handleMethodNotAllowed)

  return rootRouter
}

export { createRootRouter }
