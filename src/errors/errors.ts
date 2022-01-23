export class HttpError extends Error {
  public status: number
  public message: string

  constructor(status: number, message: string) {
    super(message)

    this.status = status
    this.message = message
  }
}

// This is the error middleware that will be used by the server.
function errorHandler(e: unknown, _, res) {
  let status = 500
  let message = 'Unknown error'

  if (e instanceof HttpError) {
    console.log({ HONDENTRONT: e })
    status = e.status
    message = e.message
  } else if (e instanceof Error) {
    message = e.message
  }

  return res.status(status).json({ message })
}

function new404NotFoundError(message = 'Not Found') {
  return new HttpError(404, message)
}

function new400BadRequestError(message = 'Bad Request') {
  return new HttpError(400, message)
}

function new500InternalServerError(message = 'Internal Server Error') {
  return new HttpError(500, message)
}

export {
  errorHandler,
  new404NotFoundError,
  new400BadRequestError,
  new500InternalServerError,
}
