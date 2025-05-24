import type { IncomingHttpHeaders } from 'http'
import type { Filter } from '../filtering/filter'

export type Body = object | string | Buffer | null

export type UrlInfo = {
  resource: string | null
  id: string | null
}

export type RequestInfo = {
  id: string | null
  resource: string
  body: Body | null
  host: string | null
  protocol: string | null
  method: string
  headers: IncomingHttpHeaders
  etag: string | null
  ifNoneMatchEtag: string | null
  queryString: string | null
}

export type TembaRequest = {
  headers: IncomingHttpHeaders
  resource: string
}

export type GetRequest = TembaRequest & {
  id: string | null
  method: 'get' | 'head'
  ifNoneMatchEtag: string | null
  filter: Filter | null
}

export type PostRequest = TembaRequest & {
  body: Body
  protocol: string | null
  host: string | null
  id: string | null
}

export type PutRequest = TembaRequest & {
  id: string
  body: Body
  etag: string | null
}

export type PatchRequest = PutRequest

export type DeleteRequest = TembaRequest & {
  id: string | null
  etag: string | null
}
