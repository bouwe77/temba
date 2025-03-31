#!/usr/bin/env node
import { create } from './create/create.js'

const [, , command, ...args] = process.argv

const ensure = (condition = false, message) => {
  if (!condition) {
    console.error(message)
    process.exit(1)
  }
}

console.log('\n🚀 Temba CLI')

ensure(command, 'Please provide a command')

if (command === 'create') {
  const projectName = args[0]
  ensure(projectName?.length, 'Please provide a project name')
  create(...args)
} else {
  ensure(false, `Unknown command: '${command}'`)
}

console.log('')
