/* filtering-delete.test.ts */
import { Server } from 'http'
import request from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { createServer } from '../createServer'
import { expectSuccess } from '../helpers'

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

let tembaServer: Server

beforeEach(async () => {
  tembaServer = await createServer({ allowDeleteCollection: true })
})

describe('DELETE', () => {
  test('Delete with no filtering deletes everything', async () => {
    const data = [{ name: 'Piet' }, { name: 'Miep' }]
    await createData(tembaServer, data)

    const deleteResponse = await request(tembaServer).delete(resource)
    expectSuccess(deleteResponse)

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(0)
  })

  test('Unknown field names or incorrectly cased field names delete 0 results', async () => {
    const data = [{ firstName: 'Piet' }]
    await createData(tembaServer, data)

    const deleteRes1 = await request(tembaServer)
      .delete(resource)
      .query('filter.unknownField[eq]=Piet')
    expectSuccess(deleteRes1)

    const deleteRes2 = await request(tembaServer)
      .delete(resource)
      .query('filter.FIRSTname[eq]=Piet')
    expectSuccess(deleteRes2)

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
  })

  test('Delete using [eq] operator (strict exact match)', async () => {
    for (const queryString of [
      'filter.name[eq]=Miep', // single [eq] filter
      'filter.name=Miep', // default operator
      'filter.name[eq]=Miep&filter.age[eq]=23', // multiple [eq] filters
    ]) {
      await createData(tembaServer, [
        { name: 'Piet', age: 24 },
        { name: 'Miep', age: 23 },
        { name: 'miep', age: 99 }, // Mixed casing variant
      ])

      const deleteRes = await request(tembaServer).delete(resource).query(queryString)
      expectSuccess(deleteRes)

      const getRemaining = await request(tembaServer).get(resource)

      // We started with 3, deleted 1, should have 2 left
      expect(getRemaining.body.length).toEqual(2)

      // Ensure 'Miep' is gone, but 'Piet' and 'miep' still remain
      const remainingNames = getRemaining.body.map((item: { name: string }) => item.name).sort()
      expect(remainingNames).toEqual(['Piet', 'miep'].sort())

      // Clean up before next loop iteration
      await request(tembaServer).delete(resource)
    }
  })

  test('Delete using [eq] operator fails on case-mismatch (strict)', async () => {
    await createData(tembaServer, [{ name: 'Miep' }])

    // Try to delete with wrong casing using strict [eq]
    await request(tembaServer).delete(resource).query('filter.name[eq]=miep')

    // Ensure it was NOT deleted
    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
  })

  test('Empty filter value using [eq] operator', async () => {
    await createData(tembaServer, [{ name: 'Piet' }, { name: '' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete using [neq] operator', async () => {
    await createData(tembaServer, [
      { name: 'Piet', isActive: true },
      { name: 'Miep', isActive: false },
    ])

    await request(tembaServer).delete(resource).query('filter.isActive[neq]=true')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete on conflicting [eq] and [neq] operators deletes 0 results', async () => {
    await createData(tembaServer, [{ name: 'Piet' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=Piet&filter.name[neq]=Piet')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
  })

  test('Delete handling of null values', async () => {
    await createData(tembaServer, [
      { name: 'Piet', value: null },
      { name: 'Miep', value: 'null' },
    ])

    await request(tembaServer).delete(resource).query('filter.value[eq]=null')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete handling of URL encoded special characters', async () => {
    await createData(tembaServer, [{ name: 'John Doe' }, { name: 'A&B' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=John%20Doe')
    await request(tembaServer).delete(resource).query('filter.name[eq]=A%26B')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(0)
  })

  test('Delete integrates safely with other query parameters', async () => {
    await createData(tembaServer, [{ name: 'Piet' }, { name: 'Miep' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=Piet&limit=1&sort=name')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Miep')
  })

  test('Delete using [ieq] operator (case-insensitive equals)', async () => {
    await createData(tembaServer, [{ name: 'Alice' }, { name: 'bob' }])

    await request(tembaServer).delete(resource).query('filter.name[ieq]=alice')
    await request(tembaServer).delete(resource).query('filter.name[ieq]=BOB')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(0)
  })

  test('Delete using [ineq] operator (case-insensitive not equals)', async () => {
    await createData(tembaServer, [
      { name: 'Alice', role: 'Admin' },
      { name: 'Bob', role: 'USER' },
    ])

    await request(tembaServer).delete(resource).query('filter.role[ineq]=user')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Bob')
  })
})

describe('Unhappy paths (400 Bad Request)', () => {
  test('Returns 400 Bad Request for malformed expressions and prevents deletion', async () => {
    await createData(tembaServer, [{ name: 'Piet' }])

    const badRequests = [
      'FILTER.name[eq]=Piet', // Bad keyword casing
      'filter.name[EQ]=Piet', // Bad operator casing
      'filter.name[invalid]=Piet', // Unsupported operator
      'filter.name[eq=Piet', // Malformed brackets
    ]

    for (const queryString of badRequests) {
      const response = await request(tembaServer).delete(resource).query(queryString)
      expect(response.status).toBe(400)
    }

    // Ensure the data was NOT deleted when syntax was bad!
    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
  })

  test('Returns 400 Bad Request when attempting to filter a single-resource DELETE by ID', async () => {
    const data = [{ name: 'Piet' }]
    await createData(tembaServer, data)

    // Fetch the item to get its generated ID
    const getAllResponse = await request(tembaServer).get(resource)
    const itemId = getAllResponse.body[0].id

    // Attempt to DELETE the specific item by ID, but include a filter
    const response = await request(tembaServer)
      .delete(`${resource}/${itemId}`)
      .query('filter.name[eq]=Piet')

    expect(response.status).toBe(400)

    // Ensure the item was NOT deleted
    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
  })
})
