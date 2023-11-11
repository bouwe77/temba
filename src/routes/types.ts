import type { Request as ExpressRequest } from 'express'
import type { Item } from '../queries/types'

export type ExtendedRequest = ExpressRequest & {
  requestInfo: RequestInfo
}

type RequestInfo = {
  resource: string
  body: unknown
  id?: string
}

export type RequestBodyInterceptorCallback = (info: RequestInfo) => void | string | object

export type RequestBodyInterceptor = {
  post?: RequestBodyInterceptorCallback
  patch?: RequestBodyInterceptorCallback
  put?: RequestBodyInterceptorCallback
}

export type ResponseInfo<T extends Item | Item[]> = {
  resource: string
  body: T
  id?: string
}

export type ResponseBodyInterceptor = (info: ResponseInfo<Item | Item[]>) => unknown

export type TembaRequest = {
  requestInfo: RequestInfo
  body: unknown
  protocol: string
  host: string
}

export type TembaResponse = {
  status: number
  body?: unknown
  headers?: Record<string, string>
}
