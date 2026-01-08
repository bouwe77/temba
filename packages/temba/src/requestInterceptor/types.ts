import type { IncomingHttpHeaders } from 'http'
import type { Body } from '../requestHandlers/types'
import type { MaybePromise } from '../types'
import type { Actions, InterceptorAction } from './actionSignals'

type InterceptedResource = {
  headers: IncomingHttpHeaders
  resource: string
}

type WithMaybeId = InterceptedResource & {
  id: string | null
}

type WithBody = InterceptedResource & {
  body: Body
}

type WithIdAndBody = InterceptedResource & {
  id: string
  body: Body
}

type WithBodyAndMaybeId = WithBody & {
  id: string | null
}

export type InterceptedReturnValue = void | InterceptorAction

export type InterceptedGetRequest = (
  request: WithMaybeId,
  actions: Actions,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedPostRequest = (
  request: WithBodyAndMaybeId,
  actions: Actions,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedPatchRequest = (
  request: WithIdAndBody,
  actions: Actions,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedPutRequest = (
  request: WithIdAndBody,
  actions: Actions,
) => MaybePromise<InterceptedReturnValue>
export type InterceptedDeleteRequest = (
  request: WithMaybeId,
  actions: Actions,
) => MaybePromise<InterceptedReturnValue>

export type RequestInterceptor = {
  get?: InterceptedGetRequest
  post?: InterceptedPostRequest
  patch?: InterceptedPatchRequest
  put?: InterceptedPutRequest
  delete?: InterceptedDeleteRequest
}
