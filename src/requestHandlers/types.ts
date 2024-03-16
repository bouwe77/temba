import type { Item } from '../queries/types'

export type UrlInfo = {
  resource: string | null
  id: string | null
}

export type RequestInfo = {
  resource: string
  id: string | null
}

export type RequestInfoWithoutId = Omit<RequestInfo, 'id'>

export type ErrorResponse = {
  message: string
  status: number
}

export interface TembaRequest {
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
