const stopWords = new Set([
  'a',
  'an',
  'the',
  'is',
  'i',
  'do',
  'how',
  'to',
  'and',
  'or',
  'of',
  'in',
  'on',
  'for',
  'with',
  'by',
  'as',
  'at',
  'from',
  'that',
  'this',
  'it',
  'are',
  'was',
  'were',
  'be',
  'been',
])

export const searchDocs = (query, index) => {
  const lowerQuery = query?.toLowerCase().trim()
  if (!lowerQuery) return []

  const tokens = lowerQuery.split(/\s+/).filter((token) => !stopWords.has(token))

  // Early return if the user only searched for stop words
  if (tokens.length === 0) return []

  return (
    index
      .map((page) => {
        const content = (page.content || '').toLowerCase()
        const title = (page.title || '').toLowerCase()
        const keywords = (page.keywords || []).map((k) => k.toLowerCase())

        // Count how many tokens are found in this page
        let score = 0
        tokens.forEach((token) => {
          if (
            content.includes(token) ||
            title.includes(token) ||
            keywords.some((k) => k.includes(token))
          ) {
            score += 1
          }
        })

        return { page, score }
      })
      // Filter out pages that didn't match at least one token
      .filter((item) => item.score > 0)
      // Sort by most matches first
      .sort((a, b) => b.score - a.score)
      .map((item) => item.page)
  )
}
