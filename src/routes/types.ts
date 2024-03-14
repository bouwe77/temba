import type { Request as ExpressRequest } from 'express'
import type { Item } from '../queries/types'

export type ExtendedRequest = ExpressRequest & {
  requestInfo: RequestInfo
}

export type RequestInfo = {
  resource: string
  id: string | null
}

export type RequestInfoWithoutId = Omit<RequestInfo, 'id'>

type InterceptedRequest = {
  resource: string
  body: unknown
}

export type RequestBodyInterceptorCallback = (info: InterceptedRequest) => void | string | object

export type RequestBodyInterceptor = {
  post?: RequestBodyInterceptorCallback
  patch?: RequestBodyInterceptorCallback
  put?: RequestBodyInterceptorCallback
}

//TODO: Fix type so that when body is an array, id is undefined
export type InterceptedResponse<T extends Item | Item[]> = {
  resource: string
  body: T
  id?: T extends Item ? string : undefined
}

export type ResponseBodyInterceptor = (info: InterceptedResponse<Item | Item[]>) => unknown

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
