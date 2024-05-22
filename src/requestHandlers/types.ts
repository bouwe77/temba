export type UrlInfo = {
  resource: string | null
  id: string | null
}

export type ErrorResponse = {
  message: string
  status: number
}

export type TembaRequest = {
  resource: string
}

export type GetRequest = TembaRequest & {
  id: string | null
}

export type PostRequest = TembaRequest & {
  body: unknown
  protocol: string | null
  host: string | null
}

export type PutRequest = TembaRequest & {
  id: string
  body: unknown
}

export type PatchRequest = PutRequest

export type DeleteRequest = TembaRequest & {
  id: string | null
}

export type TembaResponse = {
  status: number
  body?: unknown
  headers?: Record<string, string>
}
