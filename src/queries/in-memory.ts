import { Item, ItemWithoutId, Queries } from './types'

const data: { [key: string]: Item[] } = {}

const getAll = (resource: string) => {
  createResourceArrayIfNecessary(resource)

  return new Promise<Item[]>((resolve) => {
    resolve(data[resource])
  })
}

const getById = (resource: string, id: string) => {
  createResourceArrayIfNecessary(resource)

  const item = data[resource].find((item) => item.id === id) || null
  return new Promise<Item | null>((resolve) => {
    resolve(item)
  })
}

const create = (resource: string, item: ItemWithoutId) => {
  createResourceArrayIfNecessary(resource)

  const newItem = { ...item, id: String(new Date().getTime()) }

  data[resource] = [...data[resource], newItem]

  return new Promise<Item>((resolve) => {
    resolve(newItem)
  })
}

const update = (resource: string, item: Item) => {
  createResourceArrayIfNecessary(resource)

  const updatedItem = { ...item }
  data[resource] = [...data[resource].filter((r) => r.id !== item.id), updatedItem]
  return new Promise<Item>((resolve) => {
    resolve(updatedItem)
  })
}

const replace = (resource: string, item: Item) => {
  return update(resource, item)
}

const deleteById = (resource: string, id: string) => {
  createResourceArrayIfNecessary(resource)

  data[resource] = data[resource].filter((item) => item.id !== id)
  return new Promise<void>((resolve) => {
    resolve()
  })
}

const deleteAll = (resource: string) => {
  createResourceArrayIfNecessary(resource)

  data[resource] = []
  return new Promise<void>((resolve) => {
    resolve()
  })
}

const createResourceArrayIfNecessary = (resource: string) => {
  if (!Object.hasOwn(data, resource)) data[resource] = []
}

export const inMemoryQueries: Queries = {
  getAll,
  getById,
  create,
  update,
  replace,
  deleteById,
  deleteAll,
}
