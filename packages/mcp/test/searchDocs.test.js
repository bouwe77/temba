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
    test('Trims query whitespace', () => {
      expect(searchDocs(' hello ', search_index)).toEqual([helloDocument])
    })
    test('Finds no results by title', async () => {
      const result = searchDocs('goodbye', search_index)
      expect(result).toEqual([])
    })
    test('Finds no results by content', async () => {
      const result = searchDocs("Let's talk about saying goodbye to our planet.", search_index)
      expect(result).toEqual([])
    })
    test('Finds no results by keyword', async () => {
      const result = searchDocs('goodbye', search_index)
      expect(result).toEqual([])
    })
  })

  describe('Finding 1 document', () => {
    test('Finds 1 result by title', async () => {
      const result = searchDocs('hello', search_index)
      expect(result).toEqual([helloDocument])
    })
    test('Finds 1 result by content', async () => {
      const result = searchDocs("Let's talk about greeting our great planet.", search_index)
      expect(result).toEqual([helloDocument])
    })
    test('Finds 1 result by keyword', async () => {
      const result = searchDocs('earth', search_index)
      expect(result).toEqual([helloDocument])
    })
  })

  describe('Finding multiple documents', () => {
    test('Finds 2 results by title', async () => {
      const result = searchDocs('wOrld', search_index)
      expect(result).toEqual([helloDocument, scotlandDocument])
    })
    test('Finds 2 results by content', async () => {
      const result = searchDocs('great', search_index)
      expect(result).toEqual([helloDocument, scotlandDocument])
    })
    test('Finds 2 results by keyword', async () => {
      const result = searchDocs('howdy', search_index)
      expect(result).toEqual([helloDocument, scotlandDocument])
    })
  })

  describe('Finding partial matches', () => {
    test('Finds partial matches by title', async () => {
      const result = searchDocs('greet', search_index)
      expect(result).toEqual([helloDocument])
    })
    test('Finds partial matches by content', async () => {
      const result = searchDocs('mountain', search_index)
      expect(result).toEqual([scotlandDocument])
    })
    test('Finds partial matches by keyword', async () => {
      const result = searchDocs('bagpipe', search_index)
      expect(result).toEqual([scotlandDocument])
    })
  })
})
