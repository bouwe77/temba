import type { Request as ExpressRequest } from 'express'
import type { Item } from '../queries/types'

export type ExtendedRequest = ExpressRequest & {
  requestInfo: RequestInfo
}

export type RequestInfo = {
  resource: string | null
  body: unknown
  id: string | null
}

export type RequestInfoWithoutId = Omit<RequestInfo, 'id'>

export type RequestBodyInterceptorCallback = (info: RequestInfoWithoutId) => void | string | object

export type RequestBodyInterceptor = {
  post?: RequestBodyInterceptorCallback
  patch?: RequestBodyInterceptorCallback
  put?: RequestBodyInterceptorCallback
}

//TODO: Fix type so that when body is an array, id is undefined
export type ResponseInfo<T extends Item | Item[]> = {
  resource: string
  body: T
  id?: string
}

export type ResponseBodyInterceptor = (info: ResponseInfo<Item | Item[]>) => unknown

export type TembaRequest = {
  requestInfo: RequestInfo
  body: unknown
  protocol: string | null
  host: string | null
}

export type TembaResponse = {
  status: number
  body?: unknown
  headers?: Record<string, string>
}
