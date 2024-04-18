import type { Item, ItemWithoutId, Queries } from '../types'
import { MemorySync, LowSync, type SyncAdapter } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import type { PathLike } from 'node:fs'

//TODO
// * Can defaultData be the initialData provided through the config?
// * Error handling for accessing the file
// * JSON meuk async maken (zie https://github.com/typicode/lowdb/blob/main/src/presets/node.ts)

const getInMemoryDb = <Data>(defaultData: Data): LowSync<Data> => {
  return getJsonDb(new MemorySync<Data>(), defaultData)
}

const getFileDb = <Data>(filename: PathLike, defaultData: Data): LowSync<Data> => {
  return getJsonDb(new JSONFileSync<Data>(filename), defaultData)
}

const getJsonDb = <Data>(adapter: SyncAdapter<Data>, defaultData: Data): LowSync<Data> => {
  const db = new LowSync<Data>(adapter, defaultData)
  db.read()
  return db
}

type JsonConfig = {
  filename: string | null
}

export default function createJsonQueries({ filename }: JsonConfig) {
  type Data = { [key: string]: Item[] }
  const defaultData: Data = {}

  const db = filename ? getFileDb(filename, defaultData) : getInMemoryDb(defaultData)

  function getAll(resource: string) {
    const data = db.data[resource] || []
    return new Promise<Item[]>((resolve) => {
      resolve(data)
    })
  }

  function getById(resource: string, id: string) {
    const data = db.data[resource] || []
    const thingy = (data || []).find((x) => x.id === id) || null
    return new Promise<Item | null>((resolve) => {
      resolve(thingy)
    })
  }

  function create(resource: string, item: ItemWithoutId) {
    const itemWithId = { ...item, id: String(new Date().getTime()) } satisfies Item
    db.update((data) => {
      data[resource] = [...(data[resource] || []), itemWithId]
    })

    return new Promise<Item>((resolve) => {
      resolve(itemWithId)
    })
  }

  function update(resource: string, item: Item) {
    const updatedItem = { ...item } satisfies Item

    db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== item.id), updatedItem]
    })

    return new Promise<Item>((resolve) => {
      resolve(updatedItem)
    })
  }

  function replace(resource: string, item: Item) {
    return update(resource, item)
  }

  function deleteById(resource: string, id: string) {
    db.update((data) => {
      data[resource] = [...(data[resource] || []).filter((r) => r.id !== id)]
    })

    return new Promise<void>((resolve) => {
      resolve()
    })
  }

  function deleteAll(resource: string) {
    db.update((data) => {
      data[resource] = []
    })

    return new Promise<void>((resolve) => {
      resolve()
    })
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
