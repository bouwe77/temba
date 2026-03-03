import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { createServer } from './createServer'

describe('Rate limiting is on by default', () => {
  test('Requests within the default limit are allowed', async () => {
    const server = await createServer()
    const res = await request(server).get('/')
    expect(res.status).toBe(200)
  })

  test('Default limit of 100 requests per minute is enforced', async () => {
    const server = await createServer()
    for (let i = 0; i < 100; i++) {
      expect((await request(server).get('/')).status).toBe(200)
    }
    expect((await request(server).get('/')).status).toBe(429)
  })
})

describe('Rate limit is enforced', () => {
  test('Requests within the limit return a normal response', async () => {
    const server = await createServer({ rateLimit: { max: 3, windowMs: 60_000 } })
    for (let i = 0; i < 3; i++) {
      const res = await request(server).get('/')
      expect(res.status).toBe(200)
    }
  })

  test('Request exceeding the limit returns 429 with Retry-After header and error message', async () => {
    const server = await createServer({ rateLimit: { max: 2, windowMs: 60_000 } })
    expect((await request(server).get('/')).status).toBe(200)
    expect((await request(server).get('/')).status).toBe(200)
    const res = await request(server).get('/')
    expect(res.status).toBe(429)
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0)
    expect(res.body.message).toBe('Too many requests')
  })
})

describe('Rate limiting covers all routes', () => {
  test('Resource routes are rate limited', async () => {
    const server = await createServer({ rateLimit: { max: 1, windowMs: 60_000 } })
    expect((await request(server).get('/movies')).status).toBe(200)
    expect((await request(server).get('/movies')).status).toBe(429)
  })

  test('Root route is rate limited', async () => {
    const server = await createServer({ rateLimit: { max: 1, windowMs: 60_000 } })
    expect((await request(server).get('/')).status).toBe(200)
    expect((await request(server).get('/')).status).toBe(429)
  })

  test('OpenAPI route is rate limited', async () => {
    const server = await createServer({ rateLimit: { max: 1, windowMs: 60_000 } })
    expect((await request(server).get('/openapi')).status).toBe(200)
    expect((await request(server).get('/openapi')).status).toBe(429)
  })
})

describe('Rate limiting can be disabled', () => {
  test('rateLimit: false disables rate limiting entirely', async () => {
    const server = await createServer({ rateLimit: false })
    for (let i = 0; i < 20; i++) {
      const res = await request(server).get('/')
      expect(res.status).toBe(200)
    }
  })
})

describe('trustProxy: rate limits are tracked per IP using x-forwarded-for', () => {
  test('Each IP gets its own independent rate limit window', async () => {
    const server = await createServer({ rateLimit: { max: 1, windowMs: 60_000, trustProxy: true } })

    // IP A exhausts its limit
    expect((await request(server).get('/').set('x-forwarded-for', '1.1.1.1')).status).toBe(200)
    expect((await request(server).get('/').set('x-forwarded-for', '1.1.1.1')).status).toBe(429)

    // IP B is unaffected — still within its own limit
    expect((await request(server).get('/').set('x-forwarded-for', '2.2.2.2')).status).toBe(200)
  })

  test('x-forwarded-for is ignored when trustProxy is false', async () => {
    const server = await createServer({ rateLimit: { max: 1, windowMs: 60_000, trustProxy: false } })

    // Both requests come from the same socket IP (127.0.0.1 in tests), so the second is blocked
    // regardless of the x-forwarded-for header claiming a different IP
    expect((await request(server).get('/').set('x-forwarded-for', '1.1.1.1')).status).toBe(200)
    expect((await request(server).get('/').set('x-forwarded-for', '2.2.2.2')).status).toBe(429)
  })
})

describe('Rate limit window resets', () => {
  test('After the window expires, requests are allowed again', async () => {
    const server = await createServer({ rateLimit: { max: 2, windowMs: 100 } })

    // Use up the limit
    expect((await request(server).get('/')).status).toBe(200)
    expect((await request(server).get('/')).status).toBe(200)

    // Over the limit
    const blocked = await request(server).get('/')
    expect(blocked.status).toBe(429)

    // Wait for the window to reset
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should be allowed again
    const res = await request(server).get('/')
    expect(res.status).toBe(200)
  })
})
