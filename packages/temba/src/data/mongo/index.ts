import { type Db, type Options as MongoClientOptions, connect } from '@rakered/mongo'
import type { Filter } from '../../filtering/filter'
import type { Logger } from '../../log/logger'
import type { Item, ItemWithoutId, Queries } from '../types'
import { buildMongoQuery } from './filtering'

type MongoItem = {
  _id: string
  [key: string]: unknown
}

/** Options derived from a structured DataSourceConfig mongodb object (excluding `type` and `uri`). */
export type MongoOptions = {
  username?: string
  password?: string
  authSource?: string
  tls?: boolean
  tlsCAFile?: string
  tlsCertificateKeyFile?: string
  tlsAllowInvalidCertificates?: boolean
  maxPoolSize?: number
  minPoolSize?: number
  serverSelectionTimeoutMS?: number
  connectTimeoutMS?: number
  replicaSet?: string
  readPreference?: string
  writeConcern?: string
}

const removeUnderscoreFromId = ({ _id: id, ...updatedItem }: MongoItem): Item => ({
  id,
  ...updatedItem,
})

const buildMongoClientOptions = (options: MongoOptions): MongoClientOptions => {
  const clientOptions: MongoClientOptions = {}

  if (options.username !== undefined) clientOptions.auth = { username: options.username, password: options.password }
  if (options.authSource !== undefined) clientOptions.authSource = options.authSource
  if (options.tls !== undefined) clientOptions.tls = options.tls
  if (options.tlsCAFile !== undefined) clientOptions.tlsCAFile = options.tlsCAFile
  if (options.tlsCertificateKeyFile !== undefined) clientOptions.tlsCertificateKeyFile = options.tlsCertificateKeyFile
  if (options.tlsAllowInvalidCertificates !== undefined)
    clientOptions.tlsAllowInvalidCertificates = options.tlsAllowInvalidCertificates
  if (options.maxPoolSize !== undefined) clientOptions.maxPoolSize = options.maxPoolSize
  if (options.minPoolSize !== undefined) clientOptions.minPoolSize = options.minPoolSize
  if (options.serverSelectionTimeoutMS !== undefined)
    clientOptions.serverSelectionTimeoutMS = options.serverSelectionTimeoutMS
  if (options.connectTimeoutMS !== undefined) clientOptions.connectTimeoutMS = options.connectTimeoutMS
  if (options.replicaSet !== undefined) clientOptions.replicaSet = options.replicaSet
  if (options.readPreference !== undefined) clientOptions.readPreference = options.readPreference as MongoClientOptions['readPreference']
  if (options.writeConcern !== undefined) clientOptions.writeConcern = options.writeConcern

  return clientOptions
}

export const createMongoQueries = (connectionString: string, log: Logger, isTesting = false, options?: MongoOptions) => {
  let db: Db | undefined

  // In test mode each server instance gets its own collection namespace so
  // tests that create multiple servers don't share state in MongoDB.
  const collectionSuffix = isTesting ? `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : ''
  const collectionName = (resource: string) => `${resource}${collectionSuffix}`

  const connectToDatabase = async () => {
    if (!db) {
      log.debug('Connecting to MongoDB...')
      try {
        const clientOptions = options ? buildMongoClientOptions(options) : undefined
        db = await connect(connectionString, clientOptions)
        log.debug('Connected to MongoDB!')
      } catch (error) {
        log.debug('Error connecting to MongoDB')
        log.error(error)
      }
    }
  }

  const getAll = async ({ resource }: { resource: string }) => {
    await connectToDatabase()

    const items = (await db![collectionName(resource)].find({})) as MongoItem[]

    if (!items) return []

    return items.map((item) => removeUnderscoreFromId(item))
  }

  const getByFilter = async ({ resource, filter }: { resource: string; filter: Filter }) => {
    await connectToDatabase()

    const mongoQuery = buildMongoQuery(filter)
    const items = (await db![collectionName(resource)].find(mongoQuery)) as MongoItem[]

    if (!items) return []

    return items.map((item) => removeUnderscoreFromId(item))
  }

  const getById = async ({ resource, id }: { resource: string; id: string }) => {
    await connectToDatabase()

    const item = await db![collectionName(resource)].findOne({ _id: id })

    if (!item) return null

    return removeUnderscoreFromId(item)
  }

  const create = async ({
    resource,
    id,
    item,
  }: {
    resource: string
    id: string | null
    item: ItemWithoutId
  }) => {
    await connectToDatabase()

    const createdItem = await db![collectionName(resource)].insertOne(id ? { ...item, _id: id } : item)

    return removeUnderscoreFromId(createdItem.ops[0])
  }

  const update = async ({ resource, item }: { resource: string; item: Item }) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const updatedItem = await db![collectionName(resource)].findOneAndUpdate(
      { _id: id },
      { $set: itemWithoutId },
      { returnOriginal: false },
    )

    return removeUnderscoreFromId(updatedItem.value)
  }

  const replace = async ({ resource, item }: { resource: string; item: Item }) => {
    await connectToDatabase()

    const { id, ...itemWithoutId } = item

    const replacedItem = await db![collectionName(resource)].findOneAndReplace({ _id: id }, itemWithoutId, {
      returnOriginal: false,
    })

    return removeUnderscoreFromId(replacedItem.value)
  }

  const deleteById = async ({ resource, id }: { resource: string; id: string }) => {
    await connectToDatabase()

    await db![collectionName(resource)].deleteOne({ _id: id })
  }

  const deleteAll = async ({ resource }: { resource: string }) => {
    await connectToDatabase()

    await db![collectionName(resource)].deleteMany({})
  }

  const deleteByFilter = async ({ resource, filter }: { resource: string; filter: Filter }) => {
    await connectToDatabase()

    const mongoQuery = buildMongoQuery(filter)
    await db![collectionName(resource)].deleteMany(mongoQuery)
  }

  const mongoQueries: Queries = {
    getAll,
    getByFilter,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
    deleteByFilter,
  }

  return mongoQueries
}
