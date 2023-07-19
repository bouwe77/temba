type RequestInfo = {
  resourceName: string
  requestBody: unknown
}

export type RequestBodyInterceptorCallback = (info: RequestInfo) => void | string | object

export type RequestBodyInterceptor = {
  post?: RequestBodyInterceptorCallback
  patch?: RequestBodyInterceptorCallback
  put?: RequestBodyInterceptorCallback
}

type ResponseInfo = {
  resourceName: string
  responseBody: unknown
  id?: string
}

export type ResponseBodyInterceptor = (info: ResponseInfo) => unknown
