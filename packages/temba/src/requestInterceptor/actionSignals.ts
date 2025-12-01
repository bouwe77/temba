// Internal marker to identify action signals
const ACTION_SIGNAL_MARKER = Symbol('ActionSignal')

// Base interface for all action signals
type ActionSignalBase = {
  readonly [ACTION_SIGNAL_MARKER]: true
  readonly type: 'setRequestBody' | 'response'
}

// Signal for setting/modifying the request body
export type SetRequestBodySignal = {
  readonly type: 'setRequestBody'
  readonly body: unknown
} & ActionSignalBase

// Signal for returning a custom response
export type ResponseSignal = {
  readonly type: 'response'
  readonly body?: unknown
  readonly status: number
} & ActionSignalBase

// Union type of all action signals
export type ActionSignal = SetRequestBodySignal | ResponseSignal

// Type guard to check if a value is an action signal
export const isActionSignal = (value: unknown): value is ActionSignal => {
  return (
    !!value &&
    typeof value === 'object' &&
    ACTION_SIGNAL_MARKER in value &&
    (value as ActionSignal)[ACTION_SIGNAL_MARKER] === true
  )
}

// Type guard for SetRequestBodySignal
export const isSetRequestBodySignal = (signal: ActionSignal): signal is SetRequestBodySignal => {
  return signal.type === 'setRequestBody'
}

// Type guard for ResponseSignal
export const isResponseSignal = (signal: ActionSignal): signal is ResponseSignal => {
  return signal.type === 'response'
}

// Factory function to create a SetRequestBodySignal
const createSetRequestBodySignal = (body: unknown): SetRequestBodySignal => {
  return {
    [ACTION_SIGNAL_MARKER]: true,
    type: 'setRequestBody',
    body,
  }
}

// Factory function to create a ResponseSignal
const createResponseSignal = (options?: { body?: unknown; status?: number }): ResponseSignal => {
  return {
    [ACTION_SIGNAL_MARKER]: true,
    type: 'response',
    body: options?.body,
    status: options?.status ?? 200,
  }
}

// Actions object that gets injected into interceptor callbacks
export type Actions = {
  setRequestBody: (body: unknown) => SetRequestBodySignal
  response: (options?: { body?: unknown; status?: number }) => ResponseSignal
}

// Factory to create the actions object
export const createActions = (): Actions => {
  return {
    setRequestBody: createSetRequestBodySignal,
    response: createResponseSignal,
  }
}
