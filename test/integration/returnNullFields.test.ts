import { test, expect } from 'vitest'
import type { UserConfig } from '../../src/config'
import createServer from './createServer'
import { sendRequest } from '../sendRequest'

/*
  Tests when configuring returnNullFields.
*/

test.each([true, false])('returnNullFields setting is %s', async (returnNullFields) => {
  const tembaServer = createServer({ returnNullFields } satisfies UserConfig)

  // Create a car
  const createResponse = await sendRequest(tembaServer, 'post', '/cars', {
    brand: 'Mercedes-Benz',
    color: null,
  })
  expect(createResponse.body.brand).toBe('Mercedes-Benz')
  if (returnNullFields) expect(createResponse.body.color).toBeNull()
  else expect(createResponse.body.color).toBeUndefined()

  // Fetch all cars
  const getAllResponse = await sendRequest(tembaServer, 'get', '/cars')
  expect(getAllResponse.body[0].brand).toBe('Mercedes-Benz')
  if (returnNullFields) expect(getAllResponse.body[0].color).toBeNull()
  else expect(getAllResponse.body[0].color).toBeUndefined()

  // Fetch one car
  const getOneResponse = await sendRequest(tembaServer, 'get', '/cars/' + createResponse.body.id)
  expect(getOneResponse.body.brand).toBe('Mercedes-Benz')
  if (returnNullFields) expect(getOneResponse.body.color).toBeNull()
  else expect(getOneResponse.body.color).toBeUndefined()

  // Replace one car
  const replaceResponse = await sendRequest(tembaServer, 'put', '/cars/' + createResponse.body.id, {
    brand: 'Mercedes-Benz',
    color: null,
  })
  expect(replaceResponse.body.brand).toBe('Mercedes-Benz')
  if (returnNullFields) expect(replaceResponse.body.color).toBeNull()
  else expect(replaceResponse.body.color).toBeUndefined()

  // Update one car
  const updateResponse = await sendRequest(
    tembaServer,
    'patch',
    '/cars/' + createResponse.body.id,
    { brand: 'Mercedes-Benz', color: null },
  )
  expect(updateResponse.body.brand).toBe('Mercedes-Benz')
  if (returnNullFields) expect(updateResponse.body.color).toBeNull()
  else expect(updateResponse.body.color).toBeUndefined()
})
