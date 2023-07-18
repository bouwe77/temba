import { ValidatorCallback } from './types'

function interceptRequestBody(validator: ValidatorCallback, req): string | object {
  const { resourceName } = req.requestInfo
  let requestBody = req.body

  const validationResult = validator(resourceName, requestBody)

  if (!validationResult && typeof requestBody === 'object') return requestBody

  if (typeof validationResult === 'string') return validationResult

  // The requestBody was replaced by something else.
  if (validationResult) requestBody = validationResult

  if (typeof requestBody === 'object') {
    return requestBody
  } else return req.body
}

export { interceptRequestBody }
