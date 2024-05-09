type InterceptedRequest = {
  resource: string
  body: unknown
}

export type RequestInterceptorCallback = (info: InterceptedRequest) => void | string | object

export type RequestInterceptor = {
  post?: RequestInterceptorCallback
  patch?: RequestInterceptorCallback
  put?: RequestInterceptorCallback
}
