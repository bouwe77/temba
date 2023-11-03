import { Request } from 'express'
import { Item } from '../queries/types'

export interface ExtendedRequest extends Request {
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

type ResponseInfo = {
  resource: string
  body: Item | Item[]
  id?: string
}

export type ResponseBodyInterceptor = (info: ResponseInfo) => unknown
