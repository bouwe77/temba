import { test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'
import { expectSuccess } from './helpers'
import { Server } from 'http'

/*
    Tests filtering via query strings.
*/

const resource = '/items'

async function createData(tembaServer: Server, data: { name: string }[]) {
  for (const item of data) {
    const res = await request(tembaServer)
      .post(resource)
      .send(item)
      .set('Accept', 'application/json')
    expectSuccess(res)
  }
}

test('GET - Filter using [eq] operator', async () => {
  const tembaServer = await createServer()

  // Create 2 resources
  const data = [{ name: 'Piet' }, { name: 'Miep' }]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.body.length).toEqual(2)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter case-insensitive using [eq] operator
  for (const queryString of [
    'filter.name[eq]=Miep',
    'filter.name[eq]=miep',
    // No operator defaults to [eq]
    'filter.name=Miep',
    'filter.name=MIEP',
  ]) {
    const getMiepResponse = await request(tembaServer).get(resource).query(queryString)
    expect(getMiepResponse.body.length).toEqual(1)
    expect(getMiepResponse.body[0].name).toEqual('Miep')
  }
})

test('GET - Empty filter value using [eq] operator', async () => {
  const tembaServer = await createServer()

  // Create 2 resources
  const data = [
    { name: 'Piet', age: 21 },
    { name: '', age: 77 },
  ]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.body.length).toEqual(2)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter on an empty string using [eq] operator
  const getResponse = await request(tembaServer).get(resource).query('filter.name[eq]=')
  expect(getResponse.body.length).toEqual(1)
  expect(getResponse.body[0].name).toEqual('')
  expect(getResponse.body[0].age).toEqual(77)
})

test('GET - Filter using [neq] operator', async () => {
  const tembaServer = await createServer()

  // Create 2 resources
  const data = [{ name: 'Piet' }, { name: 'Miep' }]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.body.length).toEqual(2)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter case-insensitive using [neq] operator
  for (const queryString of ['filter.name[neq]=Miep', 'filter.name[neq]=miep']) {
    const getMiepResponse = await request(tembaServer).get(resource).query(queryString)
    expect(getMiepResponse.body.length).toEqual(1)
    expect(getMiepResponse.body[0].name).toEqual('Piet')
  }
})

test("GET - Filter on both [eq] and [neq] operators that don't give any results", async () => {
  const tembaServer = await createServer()

  // Create 2 resources
  const data = [
    { name: 'Piet', age: 23 },
    { name: 'Miep', age: 45 },
  ]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.body.length).toEqual(2)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter using [eq] and [neq] operators that don't give any results
  const getResponse = await request(tembaServer)
    .get(resource)
    .query('filter.name[eq]=Piet&filter.age[eq]=45')
  expect(getResponse.body.length).toEqual(0)
})

test('Multiple filters with [eq] operator', async () => {
  const tembaServer = await createServer()

  // Create 3 resources
  const data = [
    { name: 'Piet', age: 21 },
    { name: 'Miep', age: 21 },
    { name: 'Piet', age: 77 },
  ]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expect(getAllResponse.body.length).toEqual(3)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter using [eq] operator on name and age
  const getResponse = await request(tembaServer)
    .get(resource)
    .query('filter.name[eq]=Piet&filter.age[eq]=21')
  expect(getResponse.body.length).toEqual(1)
  expect(getResponse.body[0].name).toEqual('Piet')
  expect(getResponse.body[0].age).toEqual(21)
})
