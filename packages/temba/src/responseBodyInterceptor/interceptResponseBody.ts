import type { InterceptedResponse, ResponseBodyInterceptor } from './types'

export const interceptResponseBody = (
  interceptor: ResponseBodyInterceptor,
  response: InterceptedResponse,
) => {
  if (!interceptor) return response.body
  const intercepted = interceptor(response)
  return intercepted ? intercepted : response.body
}
