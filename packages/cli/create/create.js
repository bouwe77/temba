import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { execSync } from 'child_process'

export function create(projectName) {
  const templateFolder = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'starter-template',
  )

  const targetFolder = path.resolve(process.cwd(), projectName)

  console.log(`      ...Creating project in: ${targetFolder}`)

  fs.copySync(templateFolder, targetFolder, {
    overwrite: true,
  })

  execSync('npm install', {
    cwd: targetFolder,
    stdio: 'inherit',
  })

  execSync('npm start', {
    cwd: targetFolder,
    stdio: 'inherit',
  })
}
