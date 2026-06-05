import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchDocs } from './searchDocs.js'
import { version } from './version.js'

let index = []
let lastFetched = 0
const CACHE_TTL = 3600000 // 1 hour in milliseconds
const searchIndexUrl = 'https://docs.temba.io/search-index.json'

async function ensureFreshIndex() {
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
    console.error('Refresh failed, using stale index:', e)
  }
}

export const startMcpServer = async () => {
  const server = new McpServer({
    name: 'temba-docs-mcp',
    version,
  })

  // Register the tool
  server.tool(
    'search_docs',
    'Search the library documentation',
    { query: z.string() },
    async ({ query }) => {
      await ensureFreshIndex()
      const results = searchDocs(query, index).slice(0, 5) // Limit to top 5 results

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: 'No documentation found for your query.' }],
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
