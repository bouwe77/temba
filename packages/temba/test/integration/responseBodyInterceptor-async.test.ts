import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { createServer } from './createServer'

type Movie = { id: string; title: string }

describe('responseBodyInterceptor async support', () => {
  test('Async responseBodyInterceptor can fetch data and return modified response', async () => {
    // Simulate an async operation that fetches additional data
    const fetchExtraData = async (itemName: string): Promise<string> => {
      // Simulate async operation like a database call or API request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Extra data for ${itemName}`)
        }, 10)
      })
    }

    const tembaServer = await createServer({
      responseBodyInterceptor: async ({ body, resource }) => {
        if (resource === 'movies') {
          if ('id' in body) {
            // Single item - add async-fetched data
            const extraData = await fetchExtraData((body as Movie).title)
            return { ...body, asyncExtra: extraData }
          } else {
            // Collection - add async-fetched data to each item
            const enrichedItems = await Promise.all(
              body.map(async (item) => {
                const extraData = await fetchExtraData((item as Movie).title)
                return { ...item, asyncExtra: extraData }
              }),
            )
            return enrichedItems
          }
        }
      },
    })

    // Create some movies
    const movie1 = await request(tembaServer).post('/movies').send({ title: 'Inception' })
    const movie1Id = movie1.body.id

    await request(tembaServer).post('/movies').send({ title: 'Interstellar' })

    // Test GET single item with async interceptor
    const getSingleResponse = await request(tembaServer).get(`/movies/${movie1Id}`)
    expect(getSingleResponse.status).toBe(200)
    expect(getSingleResponse.body.title).toBe('Inception')
    expect(getSingleResponse.body.asyncExtra).toBe('Extra data for Inception')

    // Test GET collection with async interceptor
    const getCollectionResponse = await request(tembaServer).get('/movies')
    expect(getCollectionResponse.status).toBe(200)
    expect(getCollectionResponse.body.length).toBe(2)
    expect(getCollectionResponse.body[0].asyncExtra).toBe('Extra data for Inception')
    expect(getCollectionResponse.body[1].asyncExtra).toBe('Extra data for Interstellar')
  })

  test('Async responseBodyInterceptor that returns a promise resolving to nothing returns original body', async () => {
    const tembaServer = await createServer({
      responseBodyInterceptor: async () => {
        // Simulate async operation that returns nothing
        await new Promise((resolve) => setTimeout(resolve, 10))
        return undefined
      },
    })

    // Create an item
    const {
      body: { id },
    } = await request(tembaServer).post('/stuff').send({ name: 'testItem' })

    // As the responseBodyInterceptor returns nothing (undefined), the response body should be the same
    // as it would be without the responseBodyInterceptor.
    const response = await request(tembaServer).get(`/stuff/${id}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('testItem')
    expect(response.body.id).toEqual(id)
  })

  test('Async responseBodyInterceptor that throws an error returns 500', async () => {
    const tembaServer = await createServer({
      responseBodyInterceptor: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Async operation failed')
      },
    })

    const response = await request(tembaServer).get('/stuff')
    expect(response.statusCode).toEqual(500)
    expect(response.body.message).toEqual('Async operation failed')
  })

  test('Mixed sync and async responseBodyInterceptors work correctly', async () => {
    let useAsync = true

    const tembaServer = await createServer({
      responseBodyInterceptor: async (info) => {
        if (useAsync) {
          // Async path
          await new Promise((resolve) => setTimeout(resolve, 10))
          if ('id' in info) {
            return { ...info.body, type: 'async-single' }
          } else {
            return info.body.map((item) => ({ ...item, type: 'async-collection' }))
          }
        } else {
          // Sync path (without await)
          if ('id' in info) {
            return { ...info.body, type: 'sync-single' }
          } else {
            return info.body.map((item) => ({ ...item, type: 'sync-collection' }))
          }
        }
      },
    })

    // Create an item
    const {
      body: { id },
    } = await request(tembaServer).post('/stuff').send({ name: 'testItem' })

    // Test async path
    useAsync = true
    const asyncResponse = await request(tembaServer).get(`/stuff/${id}`)
    expect(asyncResponse.body.type).toBe('async-single')

    // Test sync path
    useAsync = false
    const syncResponse = await request(tembaServer).get(`/stuff/${id}`)
    expect(syncResponse.body.type).toBe('sync-single')
  })
})
