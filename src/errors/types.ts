export class TembaError extends Error {
  constructor(msg: string, public status: number) {
    super(msg)
    Object.setPrototypeOf(this, TembaError.prototype)

    this.status = status
  }
}
