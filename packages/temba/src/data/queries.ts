import type { Logger } from '../log/logger'
import createJsonQueries from './json'
import { createMongoQueries } from './mongo'

export const createQueries = (connectionString: string | null, log: Logger, isTesting = false) => {
  if (!connectionString) return createJsonQueries({ filename: null })

  // MongoDB (also allowed in test mode when an explicit connection string is provided)
  if (connectionString.startsWith('mongodb')) return createMongoQueries(connectionString, log, isTesting)

  // In test mode without a MongoDB connection string, always use in-memory JSON
  if (process.env.NODE_ENV === 'test') return createJsonQueries({ filename: null })

  // Single JSON file or a folder with per-resource JSON files
  if (connectionString.endsWith('.json') || /^[a-zA-Z0-9_-]+$/.test(connectionString))
    return createJsonQueries({ filename: connectionString })

  log.warn('Unknown connection string, defaulting to in-memory DB')
  return createJsonQueries({ filename: null })
}
