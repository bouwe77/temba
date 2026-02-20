import { Low, Memory, type Adapter } from 'lowdb'
import { TextFile } from 'lowdb/node'
import type { PathLike } from 'node:fs'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { Filter } from '../../filtering/filter'
import type { Item, ItemWithoutId, Queries } from '../types'
import { makePredicate } from './filtering'

class PrettyJsonFile<T> {
  private adapter: TextFile

  constructor(filename: string) {
    this.adapter = new TextFile(filename)
  }

  async read(): Promise<T | null> {
    const data = await this.adapter.read()
    return data === null ? null : (JSON.parse(data) as T)
  }

  async write(obj: T): Promise<void> {
    await this.adapter.write(JSON.stringify(obj, null, 2))
  }
}

const getInMemoryDb = <Data>(defaultData: Data): Promise<Low<Data>> => {
  return getJsonDb(new Memory<Data>(), defaultData)
}

const getFileDb = async <Data>(filename: PathLike, defaultData: Data): Promise<Low<Data>> => {
  return await getJsonDb(new PrettyJsonFile<Data>(filename as string), defaultData)
}

const getJsonDb = async <Data>(adapter: Adapter<Data>, defaultData: Data): Promise<Low<Data>> => {
  const db = new Low<Data>(adapter, defaultData)
  await db.read()
  return db
}

type JsonConfig = {
  // If null => in-memory
  // If endsWith('.json') => single-file JSON
  // Else => treat as a directory for per-resource JSON files
  filename: string | null
}

export default function createJsonQueries({ filename }: JsonConfig) {
  const mode =
    filename == null ? 'memory' : filename.toLowerCase().endsWith('.json') ? 'single' : 'dir'

  const defaultAllData: { [key: string]: Item[] } = {}
  let sharedDb: Promise<Low<{ [key: string]: Item[] }>> | null = null

  const getSharedDb = () => {
    if (!sharedDb) {
      sharedDb =
        mode === 'memory'
          ? getInMemoryDb(defaultAllData)
          : getFileDb(filename as string, defaultAllData)
    }
    return sharedDb
  }

  const resourceDbs = new Map<string, Promise<Low<{ [key: string]: Item[] }>>>()
  let ensuredDir = false
  const ensureDir = async () => {
    if (ensuredDir) return
    await fs.mkdir(filename as string, { recursive: true })
    ensuredDir = true
  }

  const getResourceDb = (resource: string) => {
    let db = resourceDbs.get(resource)
    if (!db) {
      const defaultData = { [resource]: [] as Item[] }
      db = (async () => {
        await ensureDir()
        const file = join(filename as string, `${resource}.json`)
        return await getFileDb(file, defaultData)
      })()
      resourceDbs.set(resource, db)
    }
    return db
  }

  const readAll = async (resource: string): Promise<Item[]> => {
    const db = mode === 'dir' ? await getResourceDb(resource) : await getSharedDb()
    return db.data[resource] || []
  }

  const writeAll = async (resource: string, next: Item[]) => {
    const db = mode === 'dir' ? await getResourceDb(resource) : await getSharedDb()
    await db.update((data) => {
      data[resource] = next
    })
  }

  async function getAll({ resource }: { resource: string }) {
    return await readAll(resource)
  }

  async function getByFilter({ resource, filter }: { resource: string; filter: Filter }) {
    const data = await readAll(resource)
    const pred = makePredicate(filter)

    return data.filter((item) => pred(item))
  }

  async function getById({ resource, id }: { resource: string; id: string }) {
    const data = await readAll(resource)
    return data.find((x) => x.id === id) || null
  }

  async function create({
    resource,
    id,
    item,
  }: {
    resource: string
    id: string | null
    item: ItemWithoutId
  }) {
    const data = await readAll(resource)
    const itemWithId = {
      ...item,
      id: id || String(new Date().getTime()),
    } satisfies Item
    await writeAll(resource, [...data, itemWithId])
    return itemWithId
  }

  async function update({ resource, item }: { resource: string; item: Item }) {
    const data = await readAll(resource)
    const next = data.map((r) => (r.id === item.id ? ({ ...item } satisfies Item) : r))
    await writeAll(resource, next)
    return next.find((r) => r.id === item.id)!
  }

  async function replace(query: { resource: string; item: Item }) {
    return update(query)
  }

  async function deleteById({ resource, id }: { resource: string; id: string }) {
    const data = await readAll(resource)
    const next = data.filter((r) => r.id !== id)
    await writeAll(resource, next)
  }

  async function deleteAll({ resource }: { resource: string }) {
    await writeAll(resource, [])
  }

  async function deleteByFilter({ resource, filter }: { resource: string; filter: Filter }) {
    const data = await readAll(resource)
    const pred = makePredicate(filter)

    const next = data.filter((item) => !pred(item))

    await writeAll(resource, next)
  }

  const fileQueries: Queries = {
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

  return fileQueries
}
