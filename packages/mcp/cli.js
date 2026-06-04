#!/usr/bin/env node

import { go } from './mcp.js'

const [, , command, ...args] = process.argv

const ensure = (condition = false, message) => {
  if (!condition) {
    console.error(message)
    process.exit(1)
  }
}

console.log('\n✨ Temba Docs MCP')

go()

console.log('')
