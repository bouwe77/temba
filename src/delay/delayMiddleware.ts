import type { NextFunction, Request, Response } from 'express'

const pause = (delay: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    setTimeout(next, delay)
  }
}

export const createDelayMiddleware = (delay: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    pause(delay)(req, res, next)
  }
}
