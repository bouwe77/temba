import { TembaError } from './types'

function new404NotFoundError(message = 'Not Found') {
  return new TembaError(message, 404)
}

function new400BadRequestError(message = 'Bad Request') {
  return new TembaError(message, 400)
}

export { new404NotFoundError, new400BadRequestError }
