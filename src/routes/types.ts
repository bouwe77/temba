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

export type ResponseBodyInterceptor = (
  resourceName: string,
  responseBody: unknown,
  id?: string,
) => unknown
