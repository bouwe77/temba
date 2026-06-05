import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createLogger } from './log.js'
import { searchDocs } from './searchDocs.js'
import { version } from './version.js'

let index = []
let lastFetched = 0
const CACHE_TTL = 3600000 // 1 hour in milliseconds
const searchIndexUrl = 'https://temba.bouwe.io/search_index.json'

async function ensureFreshIndex(log) {
  if (Date.now() - lastFetched < CACHE_TTL && index.length > 0) return

  try {
    const response = await fetch(searchIndexUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON, received ${contentType || 'unknown content type'}`)
    }

    index = await response.json()
    lastFetched = Date.now()
  } catch (e) {
    log(`Refresh failed, using stale index: ${e.message}`)
  }
}

export const startMcpServer = async ({ debug = false } = {}) => {
  const server = new McpServer({
    name: 'temba-docs-mcp',
    version,
  })

  const log = createLogger(debug)

  // Register the tool
  server.tool(
    'search_docs',
    'Search the library documentation',
    { query: z.string() },
    async ({ query }) => {
      await ensureFreshIndex(log)

      log(`Current index size: ${index.length}`)
      log(`First title: ${index[0]?.title}`)

      const results = searchDocs(query, index).slice(0, 5) // Limit to top 5 results

      log(`Query: "${query}" | Results: ${results.length}`)

      // Return a friendly message instead of an empty result to avoid LLM confusion.
      if (results.length === 0) {
        return {
          content: [
            { type: 'text', text: `No Temba documentation found for your query "${query}".` },
          ],
        }
      }

      return {
        content: results.map((page) => ({
          type: 'text',
          text: `Title: ${page.title}\nURL: ${page.url}\n\nContent:\n${page.content}`,
        })),
      }
    },
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
}
