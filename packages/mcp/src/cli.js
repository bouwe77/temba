#!/usr/bin/env node
import { startMcpServer } from './mcp.js'
import { searchDocs } from './searchDocs.js'

const args = process.argv.slice(2)
const isDebug = args.includes('--debug')
const queryIndex = args.findIndex((a) => a === '-q' || a === '--query')

if (isDebug) {
  console.error('✨ Temba Docs MCP running in DEBUG mode')
}

// Check for the testing flag
if (queryIndex !== -1 && args[queryIndex + 1]) {
  const query = args[queryIndex + 1]

  try {
    // 1. Fetch from the exact same remote location the MCP server uses
    const response = await fetch('https://temba.bouwe.io/search_index.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const index = await response.json()

    // 2. Execute logic
    const results = searchDocs(query, index)

    // 3. Output raw JSON (Agent-fidelity)
    process.stdout.write(JSON.stringify(results, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to fetch remote index for test:', err.message)
    process.exit(1)
  }
}

startMcpServer({ debug: isDebug }).catch(console.error)
