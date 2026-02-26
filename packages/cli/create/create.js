import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

export function create(projectName, ...flags) {
  const isTs = flags.includes('--ts')

  const templateFolder = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    isTs ? 'starter-template-ts' : 'starter-template',
  )

  const targetFolder = path.resolve(process.cwd(), projectName)

  console.log(`      ...Creating ${isTs ? 'TypeScript ' : ''}project in: ${targetFolder}`)

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
