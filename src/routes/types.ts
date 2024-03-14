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

export type InterceptedResponse =
  | {
      body: Item
      resource: string
      id: string
    }
  | {
      body: Item[]
      resource: string
    }

export type ResponseBodyInterceptor = (info: InterceptedResponse) => unknown

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
