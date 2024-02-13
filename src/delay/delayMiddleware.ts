import { NextFunction, Request, Response } from 'express'

function pause(delay: number) {
  return function (req: Request, res: Response, next: NextFunction) {
    setTimeout(next, delay)
  }
}

function createDelayMiddleware(delay: number) {
  return function (req: Request, res: Response, next: NextFunction) {
    console.log('Start delay...')
    pause(delay)(req, res, next)
    console.log('Delay finished!')
  }
}

export { createDelayMiddleware }
