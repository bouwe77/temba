import { execSync } from 'child_process'
import { defineConfig } from 'vitest/config'

const isMongoTest = !!process.env.TEMBA_MONGODB_BASE_URI
const isCustomServerTest = !!process.env.TEMBA_CUSTOM_SERVER

const grepTag = (tag: string) =>
  execSync(`grep -rl "${tag}" test/integration --include="*.test.ts"`)
    .toString()
    .trim()
    .split('\n')
    .map((f) => `./${f}`)

// When running in MongoDB mode, only include test files marked with // @mongodb
// When running in custom server mode, only include test files marked with // @custom-server
const include = isMongoTest
  ? grepTag('// @mongodb')
  : isCustomServerTest
    ? grepTag('// @custom-server')
    : ['./test/**/*.test.ts']

export default defineConfig({
  test: {
    include,
    globals: true,
    globalSetup: isMongoTest ? ['./test/mongoSetup.ts'] : [],
    setupFiles: isMongoTest ? ['./test/mongoWorkerSetup.ts'] : [],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
