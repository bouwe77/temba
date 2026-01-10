import type { InterceptedResponse, ResponseBodyInterceptor } from './types'

export const interceptResponseBody = async (
  interceptor: ResponseBodyInterceptor,
  response: InterceptedResponse,
) => {
  if (!interceptor) return response.body

  const intercepted = await interceptor(response)

  return intercepted ? intercepted : response.body
}
