type RequestInfo = {
  resource: string
  body: unknown
}

export type RequestBodyInterceptorCallback = (info: RequestInfo) => void | string | object

export type RequestBodyInterceptor = {
  post?: RequestBodyInterceptorCallback
  patch?: RequestBodyInterceptorCallback
  put?: RequestBodyInterceptorCallback
}

type ResponseInfo = {
  resource: string
  body: unknown
  id?: string
}

export type ResponseBodyInterceptor = (info: ResponseInfo) => unknown
