import request from 'supertest'
import createServer from './createServer'
import type { Config } from '../../src/config'
import { test, expect } from 'vitest'

/*
  Tests for JSON Schema validation
*/

const resourceUrl = `/cars/`

test('Schema validation POST/PUT/PATCH', async () => {
  const schemaCreateReplace = {
    type: 'object',
    properties: {
      price: { type: 'integer' },
      brand: { type: 'string' },
    },
    required: ['brand'],
    additionalProperties: false,
  }
  const schemaUpdate = { ...schemaCreateReplace, required: [] }

  const tembaServer = createServer({
    schemas: {
      cars: {
        post: schemaCreateReplace,
        put: schemaCreateReplace,
        patch: schemaUpdate,
      },
    },
  } as unknown as Config)

  // POST only the required brand
  let response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'Mercedes-Benz' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)
  expect(response.body.message).toBeUndefined()
  const mercedesId = response.body.id

  // PUT the required brand and the optional price
  response = await request(tembaServer)
    .put(resourceUrl + mercedesId)
    .send({ brand: 'Mercedes-Benz', price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PUT without the required brand
  response = await request(tembaServer)
    .put(resourceUrl + mercedesId)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // PUT with an unknown property
  response = await request(tembaServer)
    .put(resourceUrl + mercedesId)
    .send({ unknown: 'property' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // PATCH with an empty body, because none of the properties are required
  response = await request(tembaServer)
    .patch(resourceUrl + mercedesId)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a brand
  response = await request(tembaServer)
    .patch(resourceUrl + mercedesId)
    .send({ brand: 'Mercedes-Benz' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a price
  response = await request(tembaServer)
    .patch(resourceUrl + mercedesId)
    .send({ price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a brand and price
  response = await request(tembaServer)
    .patch(resourceUrl + mercedesId)
    .send({ brand: 'Mercedes-Benz', price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with an unknown property
  response = await request(tembaServer)
    .patch(resourceUrl + mercedesId)
    .send({ unknown: 'property' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST the required brand and the optional price
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'BMW', price: 100000 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)
  expect(response.body.message).toBeUndefined()

  // POST without the required brand
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST an invalid brand
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 123 })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST the required brand and an invalid price
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'Mercedes-Benz', price: 'not a number' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST with an unknown property
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({ unknown: 'property' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)
})

test('Schema validation per resource', async () => {
  const schema = {
    type: 'object',
    properties: {
      brand: { type: 'string' },
    },
    required: ['brand'],
  }

  const tembaServer = createServer({
    schemas: {
      cars: {
        post: schema,
      },
    },
  } as unknown as Config)

  // A car with a brand is valid
  let response = await request(tembaServer)
    .post(resourceUrl)
    .send({ brand: 'Mercedes-Benz' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)

  // A car without a brand is invalid
  response = await request(tembaServer)
    .post(resourceUrl)
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(400)

  // However, the bikes resource does not have a schema,
  // so a bike without a brand is valid
  response = await request(tembaServer)
    .post('/bikes/')
    .send({})
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)

  // You can even POST nonsense to the bikes resource
  response = await request(tembaServer)
    .post('/bikes/')
    .send({ foo: 'bar' })
    .set('Content-Type', 'application/json')
  expect(response.statusCode).toEqual(201)
})
