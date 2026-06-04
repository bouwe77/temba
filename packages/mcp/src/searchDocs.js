export const searchDocs = (query, index) => {
  const lowerQuery = query?.toLowerCase().trim()

  if (!lowerQuery) {
    return []
  }

  return (
    index?.filter(
      (page) =>
        page.content.toLowerCase().includes(lowerQuery) ||
        page.title.toLowerCase().includes(lowerQuery) ||
        (page.keywords && page.keywords.some((k) => k.toLowerCase().includes(lowerQuery))),
    ) || []
  )
}
