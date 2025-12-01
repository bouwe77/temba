import { test, expect, describe } from 'vitest'
import request from 'supertest'
import { createServer } from '../createServer'
import { RequestInterceptor } from '../../../src/requestInterceptor/types'

describe('requestInterceptor async support', () => {
  test('Async POST requestInterceptor can fetch data and modify request body', async () => {
    // Simulate an async operation that fetches additional data
    const fetchGenre = async (title: string): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (title.includes('Star Trek')) {
            resolve('Science Fiction')
          } else {
            resolve('Unknown')
          }
        }, 10)
      })
    }

    const requestInterceptor: RequestInterceptor = {
      post: async ({ body }) => {
        // Async operation to fetch and add genre
        const genre = await fetchGenre(body.title)
        return { ...body, genre }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    const response = await request(tembaServer)
      .post('/movies')
      .send({ title: 'Star Trek: The Motion Picture' })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe('Star Trek: The Motion Picture')
    expect(response.body.genre).toBe('Science Fiction')

    // Verify the genre was persisted
    const getResponse = await request(tembaServer).get(`/movies/${response.body.id}`)
    expect(getResponse.body.genre).toBe('Science Fiction')
  })

  test('Async PUT requestInterceptor can fetch data and modify request body', async () => {
    const fetchRating = async (): Promise<number> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(8.5)
        }, 10)
      })
    }

    const requestInterceptor: RequestInterceptor = {
      put: async ({ body }) => {
        const rating = await fetchRating()
        return { ...body, rating }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    // Create a movie first
    const createResponse = await request(tembaServer).post('/movies').send({ title: 'Inception' })
    const movieId = createResponse.body.id

    // Update with async interceptor
    const updateResponse = await request(tembaServer)
      .put(`/movies/${movieId}`)
      .send({ title: 'Inception Updated' })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.rating).toBe(8.5)
  })

  test('Async PATCH requestInterceptor can fetch data and modify request body', async () => {
    const fetchDirector = async (): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Christopher Nolan')
        }, 10)
      })
    }

    const requestInterceptor: RequestInterceptor = {
      patch: async ({ body }) => {
        const director = await fetchDirector()
        return { ...body, director }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    // Create a movie first
    const createResponse = await request(tembaServer).post('/movies').send({ title: 'Interstellar' })
    const movieId = createResponse.body.id

    // Patch with async interceptor
    const patchResponse = await request(tembaServer)
      .patch(`/movies/${movieId}`)
      .send({ year: 2014 })

    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body.director).toBe('Christopher Nolan')
    expect(patchResponse.body.year).toBe(2014)
  })

  test('Async GET requestInterceptor can perform async validation', async () => {
    const validateAccess = async (resource: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(resource === 'movies')
        }, 10)
      })
    }

    const requestInterceptor: RequestInterceptor = {
      get: async ({ resource }) => {
        const hasAccess = await validateAccess(resource)
        if (!hasAccess) {
          throw new Error('Access denied')
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    // Create a movie
    await request(tembaServer).post('/movies').send({ title: 'The Matrix' })

    // Access to movies should work
    const moviesResponse = await request(tembaServer).get('/movies')
    expect(moviesResponse.status).toBe(200)

    // Access to other resources should fail
    const booksResponse = await request(tembaServer).get('/books')
    expect(booksResponse.status).toBe(500)
    expect(booksResponse.body.message).toBe('Access denied')
  })

  test('Async DELETE requestInterceptor can perform async validation', async () => {
    const validateDeletion = async (id: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(id !== 'protected-id')
        }, 10)
      })
    }

    const requestInterceptor: RequestInterceptor = {
      delete: async ({ id }) => {
        const canDelete = await validateDeletion(id)
        if (!canDelete) {
          throw new Error('Cannot delete protected item')
        }
      },
    }

    const tembaServer = await createServer({ requestInterceptor })

    // Create a movie
    const createResponse = await request(tembaServer).post('/movies').send({ title: 'Avatar' })
    const movieId = createResponse.body.id

    // Deleting regular item should work
    const deleteResponse = await request(tembaServer).delete(`/movies/${movieId}`)
    expect(deleteResponse.status).toBe(204)

    // Deleting protected item should fail
    const protectedDeleteResponse = await request(tembaServer).delete('/movies/protected-id')
    expect(protectedDeleteResponse.status).toBe(500)
    expect(protectedDeleteResponse.body.message).toBe('Cannot delete protected item')
  })
})
