import { TembaError } from './types'

function new404NotFoundError(message = 'Not Found') {
  return new TembaError(message, 404)
}

export { new404NotFoundError }
