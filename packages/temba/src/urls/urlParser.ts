export const parseUrl = (url: string) => {
  const urlSegments = url.split('/').filter((i) => i)

  const resource = (urlSegments.length > 0 ? urlSegments[0] : null) ?? null
  const id = (urlSegments.length > 1 ? urlSegments[1] : null) ?? null

  return { resource, id }
}
