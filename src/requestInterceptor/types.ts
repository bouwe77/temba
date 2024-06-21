type InterceptedResource = {
  resource: string
}

type WithMaybeId = InterceptedResource & {
  id: string | null
}

type WithBody = InterceptedResource & {
  body: unknown
}

type WithIdAndBody = InterceptedResource & {
  id: string
  body: unknown
}

export type InterceptedReturnValue = void | object

export type InterceptedGetRequest = (request: WithMaybeId) => InterceptedReturnValue
export type InterceptedPostRequest = (request: WithBody) => InterceptedReturnValue
export type InterceptedPatchRequest = (request: WithIdAndBody) => InterceptedReturnValue
export type InterceptedPutRequest = (request: WithIdAndBody) => InterceptedReturnValue
export type InterceptedDeleteRequest = (request: WithMaybeId) => InterceptedReturnValue

export type RequestInterceptor = {
  get?: InterceptedGetRequest
  post?: InterceptedPostRequest
  patch?: InterceptedPatchRequest
  put?: InterceptedPutRequest
  delete?: InterceptedDeleteRequest
}
