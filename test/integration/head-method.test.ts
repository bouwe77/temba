import request from 'supertest'
import createServer from './createServer'

/*
  Tests for HEAD requests
*/

// This Temba server is created with the default configuration, i.e. no config object is supplied.
const tembaServer = createServer()

const resource = '/cars/'

test('HEAD returns the same response as a GET, except the response body', async () => {
  // A GET on a non existing resource yields a 404.
  const getResponse = await request(tembaServer).get(resource + 'id_does_not_exist')
  expect(getResponse.status).toBe(404)

  // A HEAD on a non existing resource yields a 404.
  const headResponse = await request(tembaServer).head(resource + 'id_does_not_exist')
  expect(headResponse.status).toBe(404)

  // Now create a new item.
  const newItem = { brand: 'Mercedes-Benz' }
  const {
    body: { id: newItemId },
  } = await request(tembaServer).post(resource).send(newItem)

  // Both a GET and HEAD on the new item yield a 200 and have the same content length.
  const getNewResponse = await request(tembaServer).get(resource + newItemId)
  expect(getNewResponse.status).toBe(200)
  expect(getNewResponse.body.brand).toBe(newItem.brand)
  let contentLength = getNewResponse.header['content-length']

  const headNewResponse = await request(tembaServer).head(resource + newItemId)
  expect(headNewResponse.status).toBe(200)
  expect(headNewResponse.header['content-length']).toBe(contentLength)

  // However, the HEAD response has no body.
  expect(JSON.stringify(headNewResponse.body)).toBe('{}')

  // A GET and HEAD on the resource collection also have the same content length.
  const getCollectionResponse = await request(tembaServer).get(resource)
  expect(getCollectionResponse.status).toBe(200)
  contentLength = getCollectionResponse.header['content-length']
  const headCollectionResponse = await request(tembaServer).head(resource)
  expect(headCollectionResponse.status).toBe(200)
  expect(headCollectionResponse.header['content-length']).toBe(contentLength)
})
