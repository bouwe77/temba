import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { create } from '../../src/index'
import WebSocket from 'ws'
import type { Server } from 'http'

describe('WebSocket broadcast feature', () => {
  let server: Server
  let port: number
  let wsClient: WebSocket

  beforeAll(async () => {
    // Create a Temba server with WebSocket enabled
    const tembaInstance = await create({
      resources: ['movies', 'books'],
      webSocket: true,
      port: 0, // Let the OS assign a random port
    })

    server = tembaInstance.start()

    // Get the actual port assigned
    const address = server.address()
    if (address && typeof address !== 'string') {
      port = address.port
    } else {
      throw new Error('Failed to get server port')
    }
  })

  afterAll(async () => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close()
    }
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  test('WebSocket server accepts connections on /ws path', async () => {
    wsClient = new WebSocket(`ws://localhost:${port}/ws`)

    await new Promise<void>((resolve, reject) => {
      wsClient.on('open', () => {
        expect(wsClient.readyState).toBe(WebSocket.OPEN)
        resolve()
      })

      wsClient.on('error', (err) => {
        reject(err)
      })
    })
  })

  test('POST broadcasts CREATE message to WebSocket clients', async () => {
    const newMovie = { title: 'The Matrix', year: 1999 }

    const messagePromise = new Promise<void>((resolve) => {
      wsClient.once('message', (data) => {
        const message = JSON.parse(data.toString())

        expect(message).toMatchObject({
          resource: 'movies',
          action: 'CREATE',
          data: expect.objectContaining({
            title: 'The Matrix',
            year: 1999,
            id: expect.any(String),
          }),
        })

        resolve()
      })
    })

    // Make a POST request to create a new movie
    await fetch(`http://localhost:${port}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie),
    })

    await messagePromise
  })

  test('PUT broadcasts UPDATE message to WebSocket clients', async () => {
    const movieId = Date.now().toString()
    const initialMovie = { title: 'Old Title' }
    const updatedMovie = { title: 'New Title' }

    // First, create a movie
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialMovie),
    })

    // Listen for the UPDATE message
    const messagePromise = new Promise<void>((resolve) => {
      wsClient.once('message', (data) => {
        const message = JSON.parse(data.toString())

        if (message.action === 'UPDATE') {
          expect(message).toMatchObject({
            resource: 'movies',
            action: 'UPDATE',
            data: expect.objectContaining({
              title: 'New Title',
              id: movieId,
            }),
          })
          resolve()
        }
      })
    })

    // Then update it
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMovie),
    })

    await messagePromise
  })

  test('PATCH broadcasts UPDATE message to WebSocket clients', async () => {
    const movieId = Date.now().toString()
    const initialMovie = { title: 'Old Title', year: 2000 }
    const partialUpdate = { year: 2001 }

    // First, create a movie
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialMovie),
    })

    // Listen for the UPDATE message
    const messagePromise = new Promise<void>((resolve) => {
      wsClient.once('message', (data) => {
        const message = JSON.parse(data.toString())

        if (message.action === 'UPDATE') {
          expect(message).toMatchObject({
            resource: 'movies',
            action: 'UPDATE',
            data: expect.objectContaining({
              title: 'Old Title',
              year: 2001,
              id: movieId,
            }),
          })
          resolve()
        }
      })
    })

    // Then patch it
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialUpdate),
    })

    await messagePromise
  })

  test('DELETE broadcasts DELETE message with only id', async () => {
    const movieId = Date.now().toString()
    const initialMovie = { title: 'To Be Deleted' }

    // First, create a movie
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialMovie),
    })

    // Listen for the DELETE message
    const messagePromise = new Promise<void>((resolve) => {
      wsClient.once('message', (data) => {
        const message = JSON.parse(data.toString())

        if (message.action === 'DELETE') {
          expect(message).toMatchObject({
            resource: 'movies',
            action: 'DELETE',
            data: { id: movieId },
          })
          resolve()
        }
      })
    })

    // Then delete it
    await fetch(`http://localhost:${port}/movies/${movieId}`, {
      method: 'DELETE',
    })

    await messagePromise
  })

  test('Multiple WebSocket clients receive the same broadcast', async () => {
    const wsClient2 = new WebSocket(`ws://localhost:${port}/ws`)
    const wsClient3 = new WebSocket(`ws://localhost:${port}/ws`)
    const newBook = { title: 'Broadcast Test' }

    // Wait for clients to connect
    await Promise.all([
      new Promise<void>((resolve) => wsClient2.on('open', resolve)),
      new Promise<void>((resolve) => wsClient3.on('open', resolve)),
    ])

    // Set up message listeners for all three clients
    const messages = Promise.all([
      new Promise<void>((resolve) => {
        wsClient.once('message', (data) => {
          const message = JSON.parse(data.toString())
          if (message.data.title === 'Broadcast Test') {
            expect(message.resource).toBe('books')
            expect(message.action).toBe('CREATE')
            resolve()
          }
        })
      }),
      new Promise<void>((resolve) => {
        wsClient2.once('message', (data) => {
          const message = JSON.parse(data.toString())
          if (message.data.title === 'Broadcast Test') {
            expect(message.resource).toBe('books')
            expect(message.action).toBe('CREATE')
            resolve()
          }
        })
      }),
      new Promise<void>((resolve) => {
        wsClient3.once('message', (data) => {
          const message = JSON.parse(data.toString())
          if (message.data.title === 'Broadcast Test') {
            expect(message.resource).toBe('books')
            expect(message.action).toBe('CREATE')
            resolve()
          }
        })
      }),
    ])

    // Create a book
    await fetch(`http://localhost:${port}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    })

    await messages

    wsClient2.close()
    wsClient3.close()
  })

  test('No broadcast when WebSocket is disabled', async () => {
    // Create a server without WebSocket
    const tembaInstance = await create({
      resources: ['articles'],
      webSocket: false,
      port: 0,
    })

    const testServer = tembaInstance.start()
    const address = testServer.address()
    const testPort = address && typeof address !== 'string' ? address.port : 0

    // Try to connect to WebSocket - should fail or timeout
    const testWs = new WebSocket(`ws://localhost:${testPort}/ws`)

    await new Promise<void>((resolve) => {
      testWs.on('error', () => {
        // Expected to fail
        testServer.close()
        resolve()
      })

      testWs.on('open', () => {
        // Should not open
        testWs.close()
        testServer.close()
        throw new Error('WebSocket should not be available when disabled')
      })

      // Timeout after 200ms
      setTimeout(() => {
        testWs.close()
        testServer.close()
        resolve()
      }, 200)
    })
  })
})
