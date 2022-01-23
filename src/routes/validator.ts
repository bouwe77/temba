import {
  new400BadRequestError,
  new500InternalServerError,
} from '../errors/errors'
import { ValidatorCallback } from './types'

function validateRequestBody(
  validator: ValidatorCallback,
  resourceName: string,
  requestBody: unknown,
): object {
  const validationResult = validator(resourceName, requestBody)

  if (!validationResult && typeof requestBody === 'object') return requestBody

  if (typeof validationResult === 'string') {
    throw new400BadRequestError(validationResult)
  }

  // The requestBody was replaced by something else.
  if (validationResult) requestBody = validationResult

  if (typeof requestBody !== 'object') {
    throw new500InternalServerError(
      'Your requestBodyValidator callback must return void, string, or an object',
    )
  }

  return requestBody
}

export { validateRequestBody }
