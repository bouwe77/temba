import { ValidateFunction } from 'ajv'
import { ValidationResult } from './types'

export const validate = (body: unknown, validate?: ValidateFunction<unknown>): ValidationResult => {
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
