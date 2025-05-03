import type { IncomingHttpHeaders } from 'http'

type MaybePromise<T> = T | Promise<T>

type InterceptedResource = {
  headers: IncomingHttpHeaders
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

type WithBodyAndMaybeId = WithBody & {
  id: string | null
}

export type InterceptedReturnValue = void | object

export type InterceptedGetRequest = (request: WithMaybeId) => MaybePromise<InterceptedReturnValue>
export type InterceptedPostRequest = (
  request: WithBodyAndMaybeId,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedPatchRequest = (
  request: WithIdAndBody,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedPutRequest = (request: WithIdAndBody) => MaybePromise<InterceptedReturnValue>
export type InterceptedDeleteRequest = (
  request: WithMaybeId,
) => MaybePromise<InterceptedReturnValue>

export type RequestInterceptor = {
  get?: InterceptedGetRequest
  post?: InterceptedPostRequest
  patch?: InterceptedPatchRequest
  put?: InterceptedPutRequest
  delete?: InterceptedDeleteRequest
}
