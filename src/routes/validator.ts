import { new400BadRequestError } from '../errors'

function validateRequestBody(validator, resourceName, requestBody) {
  const validationResult = validator(resourceName, requestBody)

  if (!validationResult) return requestBody

  if (typeof validationResult === 'string') {
    throw new400BadRequestError(validationResult)
  }

  // The requestBody was replaced by something else.
  if (validationResult) requestBody = validationResult

  return requestBody
}

export { validateRequestBody }
