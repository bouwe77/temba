import { test, expect } from 'vitest'
import { parseQueryString } from '../../../src/queryStrings/parseQueryString'

const assert = (queryString: string, expected: unknown) => {
  const actual = parseQueryString(queryString)
  expect(actual).toEqual(expected)
}

test.each([
  ['', {}],
  ['yo', { yo: '' }],
])('Really strange query strings', (queryString, expected) => {
  assert(queryString, expected)
})

test.each([
  ['?', {}],
  ['?key=value', { key: 'value' }],
  ['key=value', { key: 'value' }],
  [
    '?filter.name[eq]',
    {
      filter: {
        name: {
          eq: '',
        },
      },
    },
  ],
])('Query string can start both with or without question mark', (queryString, expected) => {
  assert(queryString, expected)
})

test.each([
  // One filter, with operator
  [
    '?filter.name[eq]=Piet',
    {
      filter: {
        name: {
          eq: 'Piet',
        },
      },
    },
  ],
  // 2 filters, both with operator
  [
    '?filter.name[eq]=Piet&filter.age[eq]=12',
    {
      filter: {
        name: {
          eq: 'Piet',
        },
        age: {
          eq: '12',
        },
      },
    },
  ],
  // 2 filters, one with and one without operator
  [
    '?filter.name[eq]=Piet&filter.age=12',
    {
      filter: {
        name: {
          eq: 'Piet',
        },
        age: '12',
      },
    },
  ],
  // One filter with operator, and a non-filter query string parameter
  [
    '?filter.name[eq]=Piet&key=value',
    {
      filter: {
        name: {
          eq: 'Piet',
        },
      },
      key: 'value',
    },
  ],
])(
  'Filters are parsed grouped into one filter key, and others are kept separate',
  (queryString, expected) => {
    assert(queryString, expected)
  },
)
