import { Response } from 'supertest'
import { expect } from 'vitest'

export const expectSuccess = (response: Response) => {
  expect(response.statusCode).toBeGreaterThanOrEqual(200)
  expect(response.statusCode).toBeLessThan(300)
}
