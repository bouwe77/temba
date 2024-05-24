type InterceptedResource = {
  resource: string
}

type WithBody = InterceptedResource & {
  body: unknown
}

type WithIdAndBody = InterceptedResource & {
  id: string
  body: unknown
}

export type InterceptedReturnValue = void | object

export type InterceptedPostRequest = (request: WithBody) => InterceptedReturnValue
export type InterceptedPatchRequest = (request: WithIdAndBody) => InterceptedReturnValue
export type InterceptedPutRequest = (request: WithIdAndBody) => InterceptedReturnValue

export type RequestInterceptor = {
  post?: InterceptedPostRequest
  patch?: InterceptedPatchRequest
  put?: InterceptedPutRequest
}
