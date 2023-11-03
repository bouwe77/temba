export type Item = Record<string, unknown>

export type Queries = {
  connectToDatabase: () => Promise<void>
  getAll: (resource: string) => Promise<Item[]>
  getById: (resource: string, id: string) => Promise<Item>
  create: (resource: string, item: Item) => Promise<Item>
  update: (resource: string, item: Item) => Promise<Item>
  replace: (resource: string, item: Item) => Promise<Item>
  deleteById: (resource: string, id: string) => Promise<void>
  deleteAll: (resource: string) => Promise<void>
}
