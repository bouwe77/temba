import 'dotenv/config'
import type { NextFunction, Request, Response } from 'express'
import type { Queries } from '../data/types'

export const isAuthEnabled = () => process.env.FEATURE_FLAG_SIMPLE_AUTH === 'true'

export const createAuthMiddleware = (queries: Queries) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-token']

    if (!token || typeof token !== 'string' || token.length === 0) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const tokens = await queries.getAll('tokens')

    const foundToken = tokens.find((t) => t.token === token)

    if (!foundToken) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    next()
  }
}
