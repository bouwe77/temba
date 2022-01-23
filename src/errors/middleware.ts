import { TembaError } from './types'

function errorHandler(e: unknown, _, res) {
  let status = 500
  let message = 'Unknown error'

  if (e instanceof TembaError) {
    console.log({ HONDENTRONT: e })
    status = e.status
    message = e.message
  } else if (e instanceof Error) {
    message = e.message
  }

  return res.status(status).json({ message })
}

export { errorHandler }
