import { expect } from 'vitest'
import { Response } from 'supertest'

export const expectSuccess = (response: Response) => {
  expect(response.statusCode).toBeGreaterThanOrEqual(200)
  expect(response.statusCode).toBeLessThan(300)
}
