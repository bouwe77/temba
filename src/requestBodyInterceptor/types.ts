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
