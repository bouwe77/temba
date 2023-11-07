function parseUrl(url: string) {
  if (!url || (url && !url.trim())) return { resource: null, id: null }

  const urlSegments = url.split('/').filter((i) => i)

  const resource = urlSegments.length > 0 ? urlSegments[0] : null
  const id = urlSegments.length > 1 ? urlSegments[1] : null

  return { resource, id }
}

export { parseUrl }
