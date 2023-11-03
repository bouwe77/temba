export const removeNullFields = (obj: unknown) => {
  if (typeof obj !== 'object') return obj
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null))
}
