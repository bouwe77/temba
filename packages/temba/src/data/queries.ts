import type { Logger } from '../log/logger'
import createJsonQueries from './json'
import { createMongoQueries } from './mongo'

export const createQueries = (connectionString: string | null, log: Logger) => {
  if (process.env.NODE_ENV === 'test' || !connectionString)
    return createJsonQueries({ filename: null })

  // MongoDB
  if (connectionString.startsWith('mongodb')) return createMongoQueries(connectionString, log)

  // Single JSON file or a folder with per-resource JSON files
  if (connectionString.endsWith('.json') || /^[a-zA-Z0-9_-]+$/.test(connectionString))
    return createJsonQueries({ filename: connectionString })

  log.warn('Unknown connection string, defaulting to in-memory DB')
  return createJsonQueries({ filename: null })
}
