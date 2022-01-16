function new404NotFoundError(message = 'Not Found') {
  const error = new Error(message)
  error.status = 404
  return error
}

function new400BadRequestError(message = 'Bad Request') {
  const error = new Error(message)
  error.status = 400
  return error
}

export { new404NotFoundError, new400BadRequestError }
