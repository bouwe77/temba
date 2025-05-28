import { test, expect, describe } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'
import { expectSuccess } from './helpers'
import { Server } from 'http'

/*
    Tests filtering via query strings.
*/

const resource = '/items'

async function createData(tembaServer: Server, data: object[]) {
  for (const item of data) {
    const res = await request(tembaServer)
      .post(resource)
      .send(item)
      .set('Accept', 'application/json')
    expectSuccess(res)
  }
}

describe('GET', () => {
  test('No filtering when "filter" or field name casing is incorrect', async () => {
    const tembaServer = await createServer()

    // Create 2 resources
    const data = [{ firstName: 'Piet' }, { fIrStNaMe: 'Kees' }, { firstName: 'Miep' }]
    await createData(tembaServer, data)

    // Get all resources without filtering
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toEqual(3)
    expect(getAllResponse.body.map((item: { firstName: string }) => item.firstName)).toEqual(
      data.map((item) => item.firstName),
    )

    // Unknown field names should not return any results
    const getUnknownFieldResponse = await request(tembaServer)
      .get(resource)
      .query('filter.unknownField[eq]=Miep')
    expect(getUnknownFieldResponse.body.length).toEqual(0)

    // Field names are case sensitive, so incorrect casing are considered unknown fields and should not return any results
    const getFilterResponse = await request(tembaServer)
      .get(resource)
      .query('filter.FIRSTname[eq]=Miep')
    expect(getFilterResponse.body.length).toEqual(0)
    expect(getFilterResponse.body.map((item: { name: string }) => item.name)).toEqual([])

    // The filter keyword is case sensitive and should be lowercase, so incorrect casing does not apply filtering
    const getFilterResponse2 = await request(tembaServer)
      .get(resource)
      .query('FILTER.firstName[eq]=Miep')
    expect(getFilterResponse2.body.length).toEqual(3)

    // Operator names are case sensitive and should be lowercase
    // I think it's a bug it does not return any results, but for now this is fine
    const getFilterResponse3 = await request(tembaServer)
      .get(resource)
      .query('filter.firstName[EQ]=Miep')
    expect(getFilterResponse3.body.length).toEqual(0)

    // If the same field name exists with different casing, it should return all results
    const getFilterResponse4 = await request(tembaServer)
      .get(resource)
      .query('filter.fIrStNaMe[eq]=Kees')
    console.dir(getFilterResponse4.body, { depth: null })
    expect(getFilterResponse4.body.length).toEqual(1)
    expect(getFilterResponse4.body[0].fIrStNaMe).toEqual('Kees')
  })

  test('Filter using [eq] operator', async () => {
    const tembaServer = await createServer()

    // Create 2 resources
    const data = [
      { name: 'Piet', age: 24, isActive: true },
      { name: 'Miep', age: 23, isActive: false },
    ]
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
      // Multiple [eq] filters
      'filter.name[eq]=miep&filter.age[eq]=23',
      'filter.name[eq]=miep&filter.age[eq]=23&filter.isActive[eq]=false',
    ]) {
      const getFilterResponse = await request(tembaServer).get(resource).query(queryString)
      expect(getFilterResponse.body.length).toEqual(1)
      expect(getFilterResponse.body[0].name).toEqual('Miep')
    }
  })

  test('Empty filter value using [eq] operator', async () => {
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

  test('Filter using [neq] operator', async () => {
    const tembaServer = await createServer()

    // Create 3 resources
    const data = [
      { name: 'Piet', isActive: true },
      { name: 'Miep', isActive: true },
      { name: '', isActive: false },
    ]
    await createData(tembaServer, data)

    // Get all resources without filtering
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toEqual(3)
    expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
      data.map((item) => item.name),
    )

    // Filter case-insensitive using [neq] operator
    for (const queryString of ['filter.name[neq]=Miep', 'filter.name[neq]=miep']) {
      const getFilterResponse = await request(tembaServer).get(resource).query(queryString)
      expect(getFilterResponse.body.length).toEqual(2)
      expect(getFilterResponse.body.map((item: { name: string }) => item.name)).toEqual([
        'Piet',
        '',
      ])
    }

    // Filter using [neq] operator on non-empty string
    for (const queryString of ['filter.name[neq]=']) {
      const getFilterResponse2 = await request(tembaServer).get(resource).query(queryString)
      expect(getFilterResponse2.body.length).toEqual(2)
      expect(getFilterResponse2.body.map((item: { name: string }) => item.name)).toEqual([
        'Piet',
        'Miep',
      ])
    }

    // Filter using [neq] operator on boolean
    const getFilterResponse3 = await request(tembaServer)
      .get(resource)
      .query('filter.isActive[neq]=true')
    expect(getFilterResponse3.body.length).toEqual(1)
    expect(getFilterResponse3.body.map((item: { name: string }) => item.name)).toEqual([''])
  })

  test("Filter on both [eq] and [neq] operators that don't give any results", async () => {
    const tembaServer = await createServer()

    // Create 2 resources
    const data = [
      { name: 'Piet', age: 23, isActive: true },
      { name: 'Miep', age: 45, isActive: false },
    ]
    await createData(tembaServer, data)

    // Get all resources without filtering
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toEqual(2)
    expect(getAllResponse.body.map((item: { name: string }) => item.name)).toEqual(
      data.map((item) => item.name),
    )

    // Filter using [eq] and [neq] operators that don't give any results
    for (const queryString of [
      'filter.name=Piet&filter.name[neq]=PIET',
      'filter.name[eq]=Piet&filter.age[eq]=45',
      'filter.name[eq]=Miep&filter.age[neq]=45',
      'filter.name[eq]=Miep&filter.name[eq]=miep',
      'filter.name[eq]=Miep&filter.name=miep',
      'filter.name[eq]=Miep&filter.isActive[neq]=false',
      'filter.name[eq]=Miep&filter.age[eq]=21&filter.isActive[neq]=true',
    ]) {
      const getResponse = await request(tembaServer).get(resource).query(queryString)
      expect(getResponse.body.length).toEqual(0)
    }
  })
})
