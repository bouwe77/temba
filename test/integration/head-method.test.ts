import { test, expect } from 'vitest'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests for HEAD requests
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

const resource = '/cars/'

test('HEAD returns the same response as a GET, except the response body', async () => {
  // A GET on a non existing resource yields a 404.
  const getResponse = await sendRequest(tembaServer, 'get', resource + 'id_does_not_exist')
  expect(getResponse.statusCode).toBe(404)

  // A HEAD on a non existing resource yields a 404.
  const headResponse = await sendRequest(tembaServer, 'head', resource + 'id_does_not_exist')
  expect(headResponse.statusCode).toBe(404)

  // Now create a new item.
  const newItem = { brand: 'Mercedes-Benz' }
  const {
    body: { id: newItemId },
  } = await sendRequest(tembaServer, 'post', resource, newItem)

  // Both a GET and HEAD on the new item yield a 200 and have the same content length.
  const getNewResponse = await sendRequest(tembaServer, 'get', resource + newItemId)
  expect(getNewResponse.statusCode).toBe(200)
  expect(getNewResponse.body.brand).toBe(newItem.brand)
  let contentLength = getNewResponse.headers['content-length']

  const headNewResponse = await sendRequest(tembaServer, 'head', resource + newItemId)
  expect(headNewResponse.statusCode).toBe(200)
  expect(headNewResponse.headers['content-length']).toBe(contentLength)

  // However, the HEAD response has no body.
  expect(JSON.stringify(headNewResponse.body)).toBe('{}')

  // A GET and HEAD on the resource collection also have the same content length.
  const getCollectionResponse = await sendRequest(tembaServer, 'get', resource)
  expect(getCollectionResponse.statusCode).toBe(200)
  contentLength = getCollectionResponse.headers['content-length']
  const headCollectionResponse = await sendRequest(tembaServer, 'head', resource)
  expect(headCollectionResponse.statusCode).toBe(200)
  expect(headCollectionResponse.headers['content-length']).toBe(contentLength)
})
