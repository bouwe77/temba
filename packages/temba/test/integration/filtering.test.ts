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

  // Create 3 resources
  const data = [{ name: 'Piet' }, { name: 'Miep' }, { name: 'Tering Henkie' }]
  await createData(tembaServer, data)

  // Get all resources without filtering
  const getAllResponse = await request(tembaServer).get(resource)
  expectSuccess(getAllResponse)
  expect(getAllResponse.body.length).toEqual(3)
  expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
    data.map((item) => item.name),
  )

  // Filter case-insensitive using [eq] operator
  const queryStrings = [
    'filter.name[eq]=Miep',
    'filter.name[eq]=miep',
    'filter.name=miep',
    'filter.name=MIEP',
  ]

  for (const queryString of queryStrings) {
    const getMiepResponse = await request(tembaServer).get(resource).query(queryString)
    expectSuccess(getMiepResponse)
    expect(getMiepResponse.body.length).toEqual(1)
    expect(getMiepResponse.body[0].name).toEqual('Miep')
  }
})
