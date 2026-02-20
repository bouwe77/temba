import qs from 'qs'

// Parses query string keys and values into an object
export const parseQueryString = (queryString: string) =>
  qs.parse(queryString, {
    allowDots: true,
    ignoreQueryPrefix: true,
  })
