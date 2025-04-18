export type Item = {
  id: string
  [key: string]: unknown
}

export type ItemWithoutId = Omit<Item, 'id'>

export type Queries = {
  getAll: (resource: string) => Promise<Item[]>
  getById: (resource: string, id: string) => Promise<Item | null>
  create: (resource: string, id: string | null, item: ItemWithoutId) => Promise<Item>
  update: (resource: string, item: Item) => Promise<Item>
  replace: (resource: string, item: Item) => Promise<Item>
  deleteById: (resource: string, id: string) => Promise<void>
  deleteAll: (resource: string) => Promise<void>
}
