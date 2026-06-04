#!/usr/bin/env node
import { startMcpServer } from './mcp.js'

console.error('✨ Temba Docs MCP starting...')

startMcpServer().catch(console.error)
