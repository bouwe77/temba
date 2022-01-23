export class TembaError extends Error {
  constructor(message: string, public status: 400 | 404 | 405 | 500) {
    super(message)
    Object.setPrototypeOf(this, TembaError.prototype)

    this.status = status
  }
}
