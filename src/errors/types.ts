export class TembaError extends Error {
  constructor(msg: string, public status: 400 | 404 | 405 | 500) {
    super(msg)
    Object.setPrototypeOf(this, TembaError.prototype)

    this.status = status
  }
}
