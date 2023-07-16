export type ValidatorCallback = (
  resourceName: string,
  requestBody: unknown,
) => void | string | object

export type RequestBodyValidator = {
  post?: ValidatorCallback
  patch?: ValidatorCallback
  put?: ValidatorCallback
}

export type ResponseBodyInterceptor = (
  resourceName: string,
  responseBody: unknown,
  id?: string,
 ) => unknown