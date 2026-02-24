import type { CorsConfig } from '../config'

export const getCorsHeaders = (cors: CorsConfig): Record<string, string> => {
  const result: Record<string, string> = {
    'Access-Control-Allow-Origin': cors.origin,
    'Access-Control-Allow-Methods': cors.methods,
    'Access-Control-Allow-Headers': cors.headers,
  }

  if (cors.credentials) {
    result['Access-Control-Allow-Credentials'] = 'true'
  }

  if (cors.exposeHeaders !== null) {
    result['Access-Control-Expose-Headers'] = cors.exposeHeaders
  }

  if (cors.maxAge !== null) {
    result['Access-Control-Max-Age'] = String(cors.maxAge)
  }

  return result
}
