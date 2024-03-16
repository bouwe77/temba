import { InterceptedResponse, ResponseBodyInterceptor } from './types'

export const interceptResponseBody = (
  interceptor: ResponseBodyInterceptor,
  info: InterceptedResponse,
) => {
  if (!interceptor) return info.body

  const intercepted = interceptor(info)

  return intercepted ? intercepted : info.body
}
