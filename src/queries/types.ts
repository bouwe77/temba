export type Item = {
  id: string
  [key: string]: unknown
}

export type Queries = {
  connectToDatabase: () => Promise<void>
  getAll: (resource: string) => Promise<Item[]>
  getById: (resource: string, id: string) => Promise<Item>
  create: (resource: string, item: unknown) => Promise<Item>
  update: (resource: string, item: unknown) => Promise<Item>
  replace: (resource: string, item: unknown) => Promise<Item>
  deleteById: (resource: string, id: string) => Promise<void>
  deleteAll: (resource: string) => Promise<void>
}
