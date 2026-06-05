import { describe, expect, test } from 'vitest'
import { searchDocs } from '../src/searchDocs'

const helloDocument = {
  title: 'Hello World',
  content: "Let's talk about greeting our great planet.",
  keywords: ['howdy', 'earth'],
}

const scotlandDocument = {
  title: 'The most beautiful country in the world',
  content: 'Scotland is so great, with its mountains, beaches and whiskies.',
  keywords: ['bagpipes', 'whisky', 'howdy'],
}

const search_index = [helloDocument, scotlandDocument]

describe('searchDocs', () => {
  describe('Finding no documents', () => {
    test('Returns no results for an empty index', () => {
      expect(searchDocs('anything', [])).toEqual([])
    })
    test('Returns no results for an empty query', () => {
      expect(searchDocs('', search_index)).toEqual([])
    })
    test('Finds no results', () => {
      expect(searchDocs('goodbye', search_index)).toEqual([])
    })
  })

  describe('Finding 1 document', () => {
    test('Finds by title', () => {
      expect(searchDocs('hello', search_index)).toEqual([helloDocument])
    })
    test('Finds by content (partial)', () => {
      // Testing partial token match instead of full sentence
      expect(searchDocs('greeting', search_index)).toEqual([helloDocument])
    })
    test('Finds by keyword', () => {
      expect(searchDocs('earth', search_index)).toEqual([helloDocument])
    })
    test('Finds by trimming query whitespace', () => {
      expect(searchDocs(' hello ', search_index)).toEqual([helloDocument])
    })
  })

  describe('Finding multiple documents', () => {
    test('Finds 2 results by title token', () => {
      // Using 'world' which appears in both titles
      const result = searchDocs('world', search_index)
      expect(result).toEqual(expect.arrayContaining([helloDocument, scotlandDocument]))
    })
    test('Finds 2 results by content token', () => {
      const result = searchDocs('great', search_index)
      expect(result).toEqual(expect.arrayContaining([helloDocument, scotlandDocument]))
    })
    test('Finds 2 results by keyword', () => {
      const result = searchDocs('howdy', search_index)
      expect(result).toEqual(expect.arrayContaining([helloDocument, scotlandDocument]))
    })
  })

  describe('Finding partial matches', () => {
    test('Finds partial matches by title', () => {
      expect(searchDocs('greet', search_index)).toEqual([helloDocument])
    })
    test('Finds partial matches by content', () => {
      expect(searchDocs('mountain', search_index)).toEqual([scotlandDocument])
    })
    test('Finds partial matches by keyword', () => {
      expect(searchDocs('bagpipe', search_index)).toEqual([scotlandDocument])
    })
  })

  describe('Edge Cases and Ranking', () => {
    test('Ranks documents with more matches higher', () => {
      // hello matches 'world', 'great' (2 matches)
      // scotland matches 'great' (1 match)
      const result = searchDocs('world great', search_index)
      expect(result[0].title).toBe('Hello World')
    })

    test('Handles pages with missing fields gracefully', () => {
      const brokenDoc = { title: 'Broken' } // Missing content and keywords
      const index = [brokenDoc]
      expect(() => searchDocs('broken', index)).not.toThrow()
      expect(searchDocs('broken', index)).toEqual([brokenDoc])
    })
  })

  describe('Stop words filtering', () => {
    test('Filters out stop words from the query', () => {
      // "the" and "is" are stop words. "world" is the only active token.
      // Both docs contain "world" in their title or content.
      const result = searchDocs('the world is', search_index)
      expect(result).toEqual(expect.arrayContaining([helloDocument, scotlandDocument]))
    })

    test('Returns no results if query only contains stop words', () => {
      // Should return [] because no tokens remain after filtering
      expect(searchDocs('the is a', search_index)).toEqual([])
    })

    test('Still finds relevant docs when stop words are present', () => {
      // "planet" is the keyword. "in the" is noise.
      expect(searchDocs('planet in the', search_index)).toEqual([helloDocument])
    })
  })
})
