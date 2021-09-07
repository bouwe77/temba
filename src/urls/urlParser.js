function parseUrl(url) {
  if (!url || (url && !url.trim())) return { resourceName: null, id: null }

  const urlSegments = url.split('/').filter((i) => i)

  const resourceName = urlSegments.length > 0 ? urlSegments[0] : null
  const id = urlSegments.length > 1 ? urlSegments[1] : null

  return { resourceName, id }
}

export { parseUrl }
