import type { ValidateFunction } from 'ajv'

export type ConfiguredSchemas = {
  [resource: string]: ConfiguredResourceSchema
}

type ConfiguredResourceSchema = {
  post?: unknown
  put?: unknown
  patch?: unknown
}

/** @internal */
export type ValidateFunctionPerResource = {
  [resource: string]: ValidateFunction<unknown>
}

/** @internal */
export type CompiledSchemas = {
  post: ValidateFunctionPerResource
  put: ValidateFunctionPerResource
  patch: ValidateFunctionPerResource
}

/** @internal */
export type ValidationResult =
  | {
      isValid: false
      errorMessage: string
    }
  | { isValid: true }
