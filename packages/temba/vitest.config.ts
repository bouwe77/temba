import { defineConfig } from 'vitest/config'

const isMongoTest = !!process.env.TEMBA_MONGODB_BASE_URI

export default defineConfig({
  test: {
    globals: true,
    globalSetup: isMongoTest ? ['./test/mongoSetup.ts'] : [],
    setupFiles: isMongoTest ? ['./test/mongoWorkerSetup.ts'] : [],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
