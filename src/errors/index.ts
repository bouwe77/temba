import { HttpError } from './types'

function new404NotFoundError(message = 'Not Found') {
  return new HttpError(404, message)
}

function new400BadRequestError(message = 'Bad Request') {
  return new HttpError(400, message)
}

function new500InternalServerError(message = 'Internal Server Error') {
  return new HttpError(500, message)
}

export { new404NotFoundError, new400BadRequestError, new500InternalServerError }
