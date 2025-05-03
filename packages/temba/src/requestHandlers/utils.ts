import type { Body } from './types'

export const removeNullFields = (obj: Body) => {
  if (typeof obj !== 'object' || obj === null) return obj
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null))
}
