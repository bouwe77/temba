#!/usr/bin/env node
import { startMcpServer } from './mcp.js'

const args = process.argv.slice(2)
const isDebug = args.includes('--debug')

if (isDebug) {
  console.error('✨ Temba Docs MCP running in DEBUG mode')
}

startMcpServer({ debug: isDebug }).catch(console.error)
