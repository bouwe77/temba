#!/usr/bin/env node

// This script updates the Temba version in the starter-template's package.json.
// It is called when a new Temba version is released.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const version = process.argv[2]

if (!version) {
  console.error('Please provide a version number')
  process.exit(1)
}

const packageJsonPath = path.join(__dirname, 'create', 'starter-template', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

packageJson.dependencies = packageJson.dependencies || {}
const versionNumber = version.replace('v', '')
packageJson.dependencies.temba = versionNumber

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
console.log(`✅ Updated starter-template to use temba@${versionNumber}`)
