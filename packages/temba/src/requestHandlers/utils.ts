export const removeNullFields = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) return obj
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null))
}
