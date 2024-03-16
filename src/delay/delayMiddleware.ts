import type { NextFunction, Request, Response } from 'express'

const pause = (delay: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    setTimeout(next, delay)
  }
}

export const createDelayMiddleware = (delay: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Start delay...')
    pause(delay)(req, res, next)
    console.log('Delay finished!')
  }
}
