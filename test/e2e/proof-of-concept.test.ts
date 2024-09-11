import { test, expect } from 'vitest'

test('E2E POC', async () => {
  const response = await fetch('http://localhost:3000')
  expect(response.status).toEqual(200)

  const text = await response.text()
  expect(text).toEqual('It works! ツ')
})
