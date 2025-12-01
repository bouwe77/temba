// Internal marker to identify action signals
const ACTION_SIGNAL_MARKER = Symbol('ActionSignal')

// Base interface for all action signals
interface ActionSignalBase {
  readonly [ACTION_SIGNAL_MARKER]: true
  readonly type: 'setRequestBody' | 'response'
}

// Signal for setting/modifying the request body
export interface SetRequestBodySignal extends ActionSignalBase {
  readonly type: 'setRequestBody'
  readonly body: any
}

// Signal for returning a custom response
export interface ResponseSignal extends ActionSignalBase {
  readonly type: 'response'
  readonly body?: any
  readonly status: number
}

// Union type of all action signals
export type ActionSignal = SetRequestBodySignal | ResponseSignal

// Type guard to check if a value is an action signal
export const isActionSignal = (value: any): value is ActionSignal => {
  return value && typeof value === 'object' && value[ACTION_SIGNAL_MARKER] === true
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
const createSetRequestBodySignal = (body: any): SetRequestBodySignal => {
  return {
    [ACTION_SIGNAL_MARKER]: true,
    type: 'setRequestBody',
    body,
  }
}

// Factory function to create a ResponseSignal
const createResponseSignal = (options?: { body?: any; status?: number }): ResponseSignal => {
  return {
    [ACTION_SIGNAL_MARKER]: true,
    type: 'response',
    body: options?.body,
    status: options?.status ?? 200,
  }
}

// Actions object that gets injected into interceptor callbacks
export type Actions = {
  setRequestBody: (body: any) => SetRequestBodySignal
  response: (options?: { body?: any; status?: number }) => ResponseSignal
}

// Factory to create the actions object
export const createActions = (): Actions => {
  return {
    setRequestBody: createSetRequestBodySignal,
    response: createResponseSignal,
  }
}
