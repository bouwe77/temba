import { execSync } from 'child_process'
import { defineConfig } from 'vitest/config'

const isMongoTest = !!process.env.TEMBA_MONGODB_BASE_URI

// When running in MongoDB mode, only include test files marked with // @mongodb
const include = isMongoTest
  ? execSync('grep -rl "// @mongodb" test/integration --include="*.test.ts"')
      .toString()
      .trim()
      .split('\n')
      .map((f) => `./${f}`)
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
