import etagFromExpress, { type StatsLike } from 'etag'

// Temba uses the `etag` module both to generate and compare ETags.
// Express only supports generating them, so to be sure we use the same algorithm for both,
// we use the etag module for both by wrapping it here.
// This means we also override the default Express etag function, but that's with the same algorithm.

export const generateEtag = (payload: unknown) => {
  return etag(JSON.stringify(payload))
}

export const etag = (entity: string | Buffer | StatsLike) => {
  return etagFromExpress(entity, { weak: true })
}
