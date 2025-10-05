import type { Item, ItemWithoutId, Queries } from '../types'
import { Low, type Adapter, Memory } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { PathLike } from 'node:fs'

const getInMemoryDb = <Data>(defaultData: Data): Promise<Low<Data>> => {
  return getJsonDb(new Memory<Data>(), defaultData)
}

const getFileDb = async <Data>(filename: PathLike, defaultData: Data): Promise<Low<Data>> => {
  return await getJsonDb(new JSONFile<Data>(filename), defaultData)
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

  async function getAll(resource: string) {
    return await readAll(resource)
  }

  async function getById(resource: string, id: string) {
    const data = await readAll(resource)
    return data.find((x) => x.id === id) || null
  }

  async function create(resource: string, id: string | null, item: ItemWithoutId) {
    const data = await readAll(resource)
    const itemWithId = {
      ...item,
      id: id || String(new Date().getTime()),
    } satisfies Item
    await writeAll(resource, [...data, itemWithId])
    return itemWithId
  }

  async function update(resource: string, item: Item) {
    const data = await readAll(resource)
    const next = [...data.filter((r) => r.id !== item.id), { ...item } satisfies Item]
    await writeAll(resource, next)
    return next.find((r) => r.id === item.id)!
  }

  async function replace(resource: string, item: Item) {
    return update(resource, item)
  }

  async function deleteById(resource: string, id: string) {
    const data = await readAll(resource)
    const next = data.filter((r) => r.id !== id)
    await writeAll(resource, next)
  }

  async function deleteAll(resource: string) {
    await writeAll(resource, [])
  }

  const fileQueries: Queries = {
    getAll,
    getById,
    create,
    update,
    replace,
    deleteById,
    deleteAll,
  }

  return fileQueries
}
