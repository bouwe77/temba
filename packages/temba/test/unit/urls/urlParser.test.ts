import { test, expect } from 'vitest'
import { parseUrl } from '../../../src/urls/urlParser'

const resourceOnly = { resource: 'stuff', id: null }
const resourceAndId = { resource: 'stuff', id: 'foo' }

test.each([
  ['stuff', resourceOnly],
  ['/stuff', resourceOnly],
  ['stuff/', resourceOnly],
  ['/stuff/', resourceOnly],
  ['//stuff/', resourceOnly],
  ['/stuff//', resourceOnly],
  ['stuff?x=1', resourceOnly],
])("URL '%s' only has a resource: %o", (url, expected) => {
  const actual = parseUrl(url)
  expect(actual).toEqual(expected)
})

test.each([
  ['stuff/foo', resourceAndId],
  ['/stuff/foo', resourceAndId],
  ['stuff/foo/', resourceAndId],
  ['/stuff/foo/', resourceAndId],
  ['/stuff//foo/', resourceAndId],
  // When using an API prefix, while not configured, the API prefix becomes the resource, and the resource the id...
  ['/api//movies/', { resource: 'api', id: 'movies' }],
  ['stuff/foo?bar=baz', resourceAndId],
])("URL '%s' has both a resource and id: %o", (url, expected) => {
  const actual = parseUrl(url)
  expect(actual).toEqual(expected)
})

test.each([
  ['stuff/foo/bar', resourceAndId],
  ['/stuff/foo/bar', resourceAndId],
  ['stuff/foo/bar/', resourceAndId],
  ['/stuff/foo/bar/', resourceAndId],
])("URL '%s' has additional path items next to a resource and id: %o", (url, expected) => {
  const actual = parseUrl(url)
  expect(actual).toEqual(expected)
})
