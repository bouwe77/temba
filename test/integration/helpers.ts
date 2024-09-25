import { expect } from 'vitest'

export const expectSuccess = (response: { statusCode: number }) => {
  expect(response.statusCode).toBeGreaterThanOrEqual(200)
  expect(response.statusCode).toBeLessThan(300)
}
