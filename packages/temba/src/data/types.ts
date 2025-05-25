import type { Filter } from '../filtering/filter'

export type Item = {
  id: string
  [key: string]: unknown
}

export type ItemWithoutId = Omit<Item, 'id'>

export type Queries = {
  getAll: (query: { resource: string; filter?: Filter }) => Promise<Item[]>
  getById: (query: { resource: string; id: string }) => Promise<Item | null>
  create: (query: { resource: string; id: string | null; item: ItemWithoutId }) => Promise<Item>
  update: (query: { resource: string; item: Item }) => Promise<Item>
  replace: (query: { resource: string; item: Item }) => Promise<Item>
  deleteById: (query: { resource: string; id: string }) => Promise<void>
  deleteAll: (query: { resource: string }) => Promise<void>
}
