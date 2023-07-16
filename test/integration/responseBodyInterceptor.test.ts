import request from 'supertest'
import { create } from '../../src/index'
import { Config } from '../../src/config'

describe('responseBodyInterceptor unusual (but allowed) implementations', () => {
  const noReturnValues = [undefined, null]
  test.each(noReturnValues)(
    'When responseBodyInterceptor returns nothing, return original response body',
    async (returnValue) => {
      const tembaServer = create({
        responseBodyInterceptor: () => {
          //do not return anyhting when returnValue is undefeind
          if (typeof returnValue !== 'undefined') return returnValue
        },
      } as unknown as Config)

      // Delete all items.
      await request(tembaServer).delete('/stuff')

      // As the responseBodyInterceptor returns nothing, the response body should be the same
      // as it would be without the responseBodyInterceptor.
      const response = await request(tembaServer).get('/stuff')
      expect(response.statusCode).toEqual(200)
      expect(response.text).toEqual('[]')

      // Create an item
      const {
        body: { id: newId },
      } = await request(tembaServer).post('/stuff').send({ name: 'newItem' })

      // As the responseBodyInterceptor returns nothing, the response body should be the same
      // as it would be without the responseBodyInterceptor.
      const response2 = await request(tembaServer).get('/stuff')
      expect(response2.body.length).toBe(1)
      expect(response2.body[0].name).toBe('newItem')

      // Now get the item by its id, which should also just return the same item.
      const response3 = await request(tembaServer).get('/stuff/' + newId)
      expect(response3.body.name).toEqual('newItem')
    },
  )

  test('When responseBodyInterceptor throws an exception, return a 500 status with error details', async () => {
    const tembaServer = create({
      responseBodyInterceptor: () => {
        throw new Error('Something went wrong')
      },
    } as unknown as Config)

    const response = await request(tembaServer).get('/stuff')
    expect(response.statusCode).toEqual(500)
    expect(response.body.message).toEqual(`Error in responseBodyInterceptor: Something went wrong`)
  })

  test('When responseBodyInterceptor does not return an object or array, still return the intercepted value', async () => {
    const tembaServer = create({
      responseBodyInterceptor: (resourceName, responseBody, id) => {
        if (id) return 'A string, instead of an object'
        else return 'A string, instead of an array'
      },
    } as unknown as Config)

    const {
      body: { id },
    } = await request(tembaServer).post('/stuff').send({ name: 'newItem' })

    const response = await request(tembaServer).get('/stuff')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('A string, instead of an array')

    const response2 = await request(tembaServer).get('/stuff/' + id)
    expect(response2.statusCode).toEqual(200)
    expect(response2.body).toEqual('A string, instead of an object')
  })
})

describe('responseBodyInterceptor returns an updated response', () => {
  const tembaServer = create({
    responseBodyInterceptor: (resourceName, responseBody, id) => {
      if (resourceName === 'stuff') {
        if (id) {
          return { ...responseBody, extra: 'stuff' }
        } else {
          return responseBody.map((item, index) => ({
            ...item,
            extra: 'stuff ' + index,
          }))
        }
      }
    },
  } as unknown as Config)

  beforeEach(async () => {
    // Delete all items
    await request(tembaServer).delete('/stuff')
  })

  test('GET a collection just returns the same collection', async () => {
    // Create 2 items
    await request(tembaServer).post('/stuff').send({ name: 'newItem1' })
    await request(tembaServer).post('/stuff').send({ name: 'newItem2' })

    // Now get the collection, which should have extra stuff
    const getAllResponse = await request(tembaServer).get('/stuff')
    expect(getAllResponse.status).toBe(200)
    expect(getAllResponse.body.length).toBe(2)
    expect(getAllResponse.body[0].name).toBe('newItem1')
    expect(getAllResponse.body[0].extra).toBe('stuff 0')
    expect(getAllResponse.body[1].name).toBe('newItem2')
    expect(getAllResponse.body[1].extra).toBe('stuff 1')
  })

  test('GET an item just returns the same item', async () => {
    // Create an item
    const newItem = { name: 'newItem' }
    const {
      body: { id },
    } = await request(tembaServer).post('/stuff').send(newItem)

    // Now get the item, which should just return the same item.
    const response = await request(tembaServer).get('/stuff/' + id)

    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('newItem')
    expect(response.body.id).toEqual(id)
    expect(response.body.extra).toEqual('stuff')
  })
})
