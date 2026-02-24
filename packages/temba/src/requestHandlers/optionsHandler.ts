import type { IncomingMessage, ServerResponse } from 'http'
import type { CorsConfig } from '../config'
import { sendResponse } from '../responseHandler'

export const handleOptionsRequest = (
  res: ServerResponse<IncomingMessage>,
  cors: CorsConfig,
) => sendResponse(res, cors)({ statusCode: 204 })
