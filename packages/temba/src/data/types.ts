export type Item = {
  id: string
  [key: string]: unknown
}

export type ItemWithoutId = Omit<Item, 'id'>

export type Queries = {
  getAll: (args: { resource: string }) => Promise<Item[]>
  getById: (args: { resource: string; id: string }) => Promise<Item | null>
  create: (args: { resource: string; id: string | null; item: ItemWithoutId }) => Promise<Item>
  update: (args: { resource: string; item: Item }) => Promise<Item>
  replace: (args: { resource: string; item: Item }) => Promise<Item>
  deleteById: (args: { resource: string; id: string }) => Promise<void>
  deleteAll: (args: { resource: string }) => Promise<void>
}
