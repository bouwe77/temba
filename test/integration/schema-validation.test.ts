import { test, expect } from 'vitest'
import createServer from './createServer'
import type { UserConfig } from '../../src/config'
import { sendRequest } from '../sendRequest'

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
  } satisfies UserConfig)

  // POST only the required brand
  let response = await sendRequest(tembaServer, 'post', resourceUrl, { brand: 'Mercedes-Benz' })
  expect(response.statusCode).toEqual(201)
  expect(response.body.message).toBeUndefined()
  const mercedesId = response.body.id

  // PUT the required brand and the optional price
  response = await sendRequest(tembaServer, 'put', resourceUrl + mercedesId, {
    brand: 'Mercedes-Benz',
    price: 100000,
  })
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PUT without the required brand
  response = await sendRequest(tembaServer, 'put', resourceUrl + mercedesId, {})
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // PUT with an unknown property
  response = await sendRequest(tembaServer, 'put', resourceUrl + mercedesId, {
    unknown: 'property',
  })
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // PATCH with an empty body, because none of the properties are required
  response = await sendRequest(tembaServer, 'patch', resourceUrl + mercedesId, {})
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a brand
  response = await sendRequest(tembaServer, 'patch', resourceUrl + mercedesId, {
    brand: 'Mercedes-Benz',
  })
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a price
  response = await sendRequest(tembaServer, 'patch', resourceUrl + mercedesId, { price: 100000 })
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with a brand and price
  response = await sendRequest(tembaServer, 'patch', resourceUrl + mercedesId, {
    brand: 'Mercedes-Benz',
    price: 100000,
  })
  expect(response.statusCode).toEqual(200)
  expect(response.body.message).toBeUndefined()

  // PATCH with an unknown property
  response = await sendRequest(tembaServer, 'patch', resourceUrl + mercedesId, {
    unknown: 'property',
  })
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST the required brand and the optional price
  response = await sendRequest(tembaServer, 'post', resourceUrl, { brand: 'BMW', price: 100000 })
  expect(response.statusCode).toEqual(201)
  expect(response.body.message).toBeUndefined()

  // POST without the required brand
  response = await sendRequest(tembaServer, 'post', resourceUrl, {})
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST an invalid brand
  response = await sendRequest(tembaServer, 'post', resourceUrl, { brand: 123 })
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST the required brand and an invalid price
  response = await sendRequest(tembaServer, 'post', resourceUrl, {
    brand: 'Mercedes-Benz',
    price: 'not a number',
  })
  expect(response.statusCode).toEqual(400)
  expect(response.body.message.length).toBeGreaterThan(0)

  // POST with an unknown property
  response = await sendRequest(tembaServer, 'post', resourceUrl, { unknown: 'property' })
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
  } satisfies UserConfig)

  // A car with a brand is valid
  let response = await sendRequest(tembaServer, 'post', resourceUrl, { brand: 'Mercedes-Benz' })
  expect(response.statusCode).toEqual(201)

  // A car without a brand is invalid
  response = await sendRequest(tembaServer, 'post', resourceUrl, {})
  expect(response.statusCode).toEqual(400)

  // However, the bikes resource does not have a schema,
  // so a bike without a brand is valid
  response = await sendRequest(tembaServer, 'post', '/bikes/', {})
  expect(response.statusCode).toEqual(201)

  // You can even POST nonsense to the bikes resource
  response = await sendRequest(tembaServer, 'post', '/bikes/', { foo: 'bar' })
  expect(response.statusCode).toEqual(201)
})
