#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const cleanArgs = args.filter((arg) => arg !== '--dry-run')

const [version, targetPath] = cleanArgs

if (!version || !targetPath) {
  console.error('Usage: node update-version.js <version> <path> [--dry-run]')
  process.exit(1)
}

const versionNumber = version.replace(/^v/, '')

const updatePackageJson = (folder) => {
  const packageJsonPath = path.join(folder, 'package.json')
  if (!fs.existsSync(packageJsonPath)) return false

  try {
    const fileContent = fs.readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(fileContent)
    let updated = false

    // 1. Update the package's own version
    if (packageJson.version !== versionNumber) {
      packageJson.version = versionNumber
      updated = true
    }

    // 2. Update dependencies on 'temba'
    const targets = ['dependencies', 'devDependencies']
    targets.forEach((type) => {
      if (packageJson[type]?.['temba']) {
        packageJson[type].temba = versionNumber
        updated = true
      }
    })

    if (updated) {
      if (isDryRun) {
        console.log(`[DRY RUN] Would update ${packageJsonPath} to version ${versionNumber}`)
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
        console.log(`✅ Updated ${packageJsonPath} to version ${versionNumber}`)
      }
      return true
    }
  } catch (error) {
    console.error(`❌ Error processing ${packageJsonPath}:`, error.message)
  }
  return false
}

const absolutePath = path.resolve(targetPath)
if (!fs.existsSync(absolutePath)) {
  console.error(`❌ Path not found: ${targetPath}`)
  process.exit(1)
}

if (fs.existsSync(path.join(absolutePath, 'package.json'))) {
  updatePackageJson(absolutePath)
} else if (fs.lstatSync(absolutePath).isDirectory()) {
  const subfolders = fs.readdirSync(absolutePath)
  for (const sub of subfolders) {
    const fullSubPath = path.join(absolutePath, sub)
    if (fs.lstatSync(fullSubPath).isDirectory()) {
      updatePackageJson(fullSubPath)
    }
  }
}
