export type RequestBodyInterceptorCallback = (
  resourceName: string,
  requestBody: unknown,
) => void | string | object

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
