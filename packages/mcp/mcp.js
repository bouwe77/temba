import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { searchDocs } from './searchDocs.js'
import { version } from './version.js'

export const startMcpServer = async () => {
  const server = new McpServer({
    name: 'temba-docs-mcp',
    version,
  })

  // Fetch the index once on startup
  let index = []
  const searchIndexUrl = 'https://docs.temba.io/search-index.json'
  try {
    const response = await fetch(searchIndexUrl)
    index = await response.json()
  } catch (e) {
    console.error('Failed to fetch ' + searchIndexUrl, e)
  }

  // Register the tool
  server.tool(
    'search_docs',
    'Search the library documentation',
    { query: z.string() },
    async ({ query }) => {
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
