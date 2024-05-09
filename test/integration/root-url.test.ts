import { test, expect, describe } from 'vitest'
import request from 'supertest'
import createServer from './createServer'

/*
  Tests on the root URL: "/"
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

describe('GET on root URL', () => {
  test('GET on root URL returns JSON when no Accept header specified', async () => {
    const response = await request(tembaServer).get('/')

    expect(response.statusCode).toEqual(200)
    expect(response.body.message).toEqual('It works! ツ')
    expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
  })

  test('GET on root URL returns JSON when Accept header is set to application/json', async () => {
    const response = await request(tembaServer).get('/').set('Accept', 'application/json')

    expect(response.statusCode).toEqual(200)
    expect(response.body.message).toEqual('It works! ツ')
    expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
  })

  test('GET on root URL returns plain text when Accept header is set to text/plain', async () => {
    const response = await request(tembaServer).get('/').set('Accept', 'text/plain')

    expect(response.statusCode).toEqual(200)
    expect(response.text).toEqual('It works! ツ')
    expect(response.headers['content-type']).toEqual('text/plain; charset=utf-8')
  })

  test('GET on root URL returns plain text when Accept header is set to text/html', async () => {
    const response = await request(tembaServer).get('/').set('Accept', 'text/html')

    expect(response.statusCode).toEqual(200)
    expect(response.text).toEqual('It works! ツ')
    expect(response.headers['content-type']).toEqual('text/html; charset=utf-8')
  })
})

describe('Other methods on root URL, which are not allowed', () => {
  test('POST on root URL returns Method Not Allowed error', async () => {
    const response = await request(tembaServer).post('/')

    expect(response.statusCode).toEqual(405)
    expect(response.body.message).toEqual('Method Not Allowed')
  })

  test('PUT on root URL returns Method Not Allowed error', async () => {
    const response = await request(tembaServer).put('/')

    expect(response.statusCode).toEqual(405)
    expect(response.body.message).toEqual('Method Not Allowed')
  })

  test('DELETE on root URL returns Method Not Allowed error', async () => {
    const response = await request(tembaServer).delete('/')

    expect(response.statusCode).toEqual(405)
    expect(response.body.message).toEqual('Method Not Allowed')
  })
})
