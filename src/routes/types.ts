import { Request } from 'express'
import { Item } from '../queries/types'

export type ExtendedRequest = Request & {
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
