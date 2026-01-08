import type { InterceptedResponse, ResponseBodyInterceptor } from './types'

export const interceptResponseBody = async (
  interceptor: ResponseBodyInterceptor,
  info: InterceptedResponse,
) => {
  if (!interceptor) return info.body

  const intercepted = await interceptor(info)

  return intercepted ? intercepted : info.body
}
