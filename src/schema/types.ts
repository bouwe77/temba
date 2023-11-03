import { ValidateFunction } from 'ajv'

export type ConfiguredSchemas = {
  [resource: string]: ConfiguredResourceSchema
}

type ConfiguredResourceSchema = {
  post?: unknown
  put?: unknown
  patch?: unknown
}

export type TransformedSchemas = {
  post?: {
    [resource: string]: unknown
  }
  put?: {
    [resource: string]: unknown
  }
  patch?: {
    [resource: string]: unknown
  }
}

export type ValidateFunctionPerResource = {
  [resource: string]: ValidateFunction<unknown>
}

export type CompiledSchemas = {
  post?: ValidateFunctionPerResource
  put?: ValidateFunctionPerResource
  patch?: ValidateFunctionPerResource
}

export type ValidationResult =
  | {
      isValid: false
      errorMessage: string
    }
  | { isValid: true }