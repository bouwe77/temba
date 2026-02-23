import type { IncomingHttpHeaders } from 'http'
import type { Body } from '../requestHandlers/types'
import type { MaybePromise } from '../types'
import type { InterceptorAction, NonResourceActions, ResourceActions } from './interceptorActions'

// Request type discriminator values
export type ResourceRequestType = 'resource'
export type NonResourceRequestType = 'root' | 'openapi' | 'static'
export type RequestType = ResourceRequestType | NonResourceRequestType

// Non-resource request — type only + headers + url
type InterceptedNonResourceRequest = {
  type: NonResourceRequestType
  headers: IncomingHttpHeaders
  url: string
}

// Resource request base — type + headers + resource + id + url
type InterceptedResourceRequest = {
  type: ResourceRequestType
  headers: IncomingHttpHeaders
  resource: string
  id: string | null
  url: string
}

type WithBody = InterceptedResourceRequest & {
  body: Body
}

type WithIdAndBody = InterceptedResourceRequest & {
  id: string
  body: Body
}

export type InterceptedReturnValue = void | InterceptorAction

// GET: fires for both resource and non-resource requests
export type InterceptedGetRequest = (
  request: InterceptedResourceRequest | InterceptedNonResourceRequest,
  actions: ResourceActions | NonResourceActions,
) => MaybePromise<InterceptedReturnValue>

// POST: resource only
export type InterceptedPostRequest = (
  request: WithBody,
  actions: ResourceActions,
) => MaybePromise<InterceptedReturnValue>

// PATCH: resource only (id always present)
export type InterceptedPatchRequest = (
  request: WithIdAndBody,
  actions: ResourceActions,
) => MaybePromise<InterceptedReturnValue>

// PUT: resource only (id always present)
export type InterceptedPutRequest = (
  request: WithIdAndBody,
  actions: ResourceActions,
) => MaybePromise<InterceptedReturnValue>

// DELETE: resource only
export type InterceptedDeleteRequest = (
  request: InterceptedResourceRequest,
  actions: ResourceActions,
) => MaybePromise<InterceptedReturnValue>

export type RequestInterceptor = {
  get?: InterceptedGetRequest
  post?: InterceptedPostRequest
  patch?: InterceptedPatchRequest
  put?: InterceptedPutRequest
  delete?: InterceptedDeleteRequest
}
