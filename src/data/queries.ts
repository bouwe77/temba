import type { Logger } from '../log/logger'
import createJsonQueries from './json'
import { createMongoQueries } from './mongo'

export const createQueries = (connectionString: string | null, logger: Logger) => {
  if (process.env.NODE_ENV === 'test' || !connectionString)
    return createJsonQueries({ filename: null })

  if (connectionString.endsWith('.json')) return createJsonQueries({ filename: connectionString })

  if (connectionString.startsWith('mongodb')) return createMongoQueries(connectionString, logger)

  return createJsonQueries({ filename: null })
}
