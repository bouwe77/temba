import type { ValidateFunction } from 'ajv'
import type { ValidationResult } from './types'
import type { Body } from '../requestHandlers/types'

export const validate = (body: Body, validate?: ValidateFunction<unknown>): ValidationResult => {
  if (!validate) return { isValid: true }

  if (validate(body)) {
    return { isValid: true }
  } else {
    return {
      isValid: false,
      errorMessage: validate.errors?.[0]?.message ?? 'Unknown schema validation error',
    }
  }
}
