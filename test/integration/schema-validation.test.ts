import request from 'supertest'
import createServer from './createServer'
import { Config } from '../../src/config'

/*
  Tests for JSON Schema validation
*/

const resourceUrl = `/cars/`

const createOrReplaceSchema = {
  type: 'object',
  properties: {
    price: { type: 'integer' },
    brand: { type: 'string' },
  },
  required: ['brand'],
  additionalProperties: false,
}
const partialUpdateSchema = {
  type: 'object',
  properties: {
    price: { type: 'integer' },
    brand: { type: 'string' },
  },
  additionalProperties: false,
}

const tembaServer = createServer({
  schemas: {
    cars: {
      post: createOrReplaceSchema,
      put: createOrReplaceSchema,
      patch: partialUpdateSchema,
    },
  },
} as unknown as Config)

test('Schema validation POST/PUT', async () => {
  // POST only the required brand
  let response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'Mercedes-Benz' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)
  const mercedesId = response.body.id

  // PUT the required brand and the optional price
  response = await request(tembaServer)
    .put(resourceUrl + mercedesId)
    .send({ brand: 'Mercedes-Benz', price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)

  // PUT without the required brand
  response = await request(tembaServer)
    .put(resourceUrl + mercedesId)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)

  //TODO PATCH tests...

  // POST the required brand and the optional price
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'BMW', price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)

  // POST without the required brand
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)

  // POST an invalid brand
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 123 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)

  // POST the required brand and an invalid price
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'Mercedes-Benz', price: 'not a number' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
})
