// Internal marker to identify interceptor actions
const INTERCEPTOR_ACTION_MARKER = Symbol('InterceptorAction')

// Base interface for all interceptor actions
type InterceptorActionBase = {
  readonly [INTERCEPTOR_ACTION_MARKER]: true
  readonly type: 'setRequestBody' | 'response'
}

// Action for setting/modifying the request body
export type SetRequestBodyAction = {
  readonly type: 'setRequestBody'
  readonly body: unknown
} & InterceptorActionBase

// Action for returning a custom response
export type ResponseAction = {
  readonly type: 'response'
  readonly body?: unknown
  readonly status: number
} & InterceptorActionBase

// Union type of all interceptor actions
export type InterceptorAction = SetRequestBodyAction | ResponseAction

// Type guard to check if a value is an interceptor action
export const isInterceptorAction = (value: unknown): value is InterceptorAction => {
  return (
    !!value &&
    typeof value === 'object' &&
    INTERCEPTOR_ACTION_MARKER in value &&
    (value as InterceptorAction)[INTERCEPTOR_ACTION_MARKER] === true
  )
}

// Type guard for SetRequestBodyAction
export const isSetRequestBodyAction = (action: InterceptorAction): action is SetRequestBodyAction => {
  return action.type === 'setRequestBody'
}

// Type guard for ResponseAction
export const isResponseAction = (action: InterceptorAction): action is ResponseAction => {
  return action.type === 'response'
}

// Factory function to create a SetRequestBodyAction
const createSetRequestBodyAction = (body: unknown): SetRequestBodyAction => {
  return {
    [INTERCEPTOR_ACTION_MARKER]: true,
    type: 'setRequestBody',
    body,
  }
}

// Factory function to create a ResponseAction
const createResponseAction = (options?: { body?: unknown; status?: number }): ResponseAction => {
  return {
    [INTERCEPTOR_ACTION_MARKER]: true,
    type: 'response',
    body: options?.body,
    status: options?.status ?? 200,
  }
}

// Actions object that gets injected into interceptor callbacks
export type Actions = {
  setRequestBody: (body: unknown) => SetRequestBodyAction
  response: (options?: { body?: unknown; status?: number }) => ResponseAction
}

// Factory to create the actions object
export const createActions = (): Actions => {
  return {
    setRequestBody: createSetRequestBodyAction,
    response: createResponseAction,
  }
}
