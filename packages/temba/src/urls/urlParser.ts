export const parseUrl = (url: string) => {
  let pathname: string

  try {
    // for absolute URLs
    pathname = new URL(url).pathname
  } catch {
    // for relative URLs or malformed ones
    pathname = url.split('?')[0] ?? ''
  }

  const segments = pathname.split('/').filter(Boolean)

  return {
    resource: segments[0] ?? null,
    id: segments[1] ?? null,
  }
}
