import { JSONFileSyncPreset } from 'lowdb/node'
import type { Item, ItemWithoutId, Queries } from './types'

export default function createFileQueries() {
  type Data = { data: { [key: string]: Item[] } }
  const defaultData: Data = { data: {} }
  const db = JSONFileSyncPreset<Data>(`db.json`, defaultData)

  function getAll(resource: string) {
    const data = db.data.data[resource] || []
    return new Promise<Item[]>((resolve) => {
      resolve(data)
    })
  }

  function getById(resource: string, id: string) {
    const data = db.data.data[resource] || []
    const thingy = (data || []).find((x) => x.id === id) || null
    return new Promise<Item | null>((resolve) => {
      resolve(thingy)
    })
  }

  function create(resource: string, item: ItemWithoutId) {
    const itemWithId = { ...item, id: String(new Date().getTime()) } satisfies Item
    db.update((data) => {
      data.data[resource] = [...(data.data[resource] || []), itemWithId]
    })

    return new Promise<Item>((resolve) => {
      resolve(itemWithId)
    })
  }

  function update(resource: string, item: Item) {
    const updatedItem = { ...item } satisfies Item

    db.update((data) => {
      data.data[resource] = [
        ...(data.data[resource] || []).filter((r) => r.id !== item.id),
        updatedItem,
      ]
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
      data.data[resource] = [...(data.data[resource] || []).filter((r) => r.id !== id)]
    })

    return new Promise<void>((resolve) => {
      resolve()
    })
  }

  function deleteAll(resource: string) {
    db.update((data) => {
      data.data[resource] = []
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
