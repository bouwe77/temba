// @mongodb
/* filtering-delete.test.ts */
import { Server } from 'http'
import request from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { createServer } from '../createServer'
import { expectSuccess } from '../helpers'

/*
    Tests filtering DELETE requests via query strings.
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

describe('String exact match operators: eq and neq', () => {
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

  test('Delete using [eq] operator (case-insensitive equals)', async () => {
    for (const queryString of [
      'filter.name[eq]=Miep', // single [eq] filter
      'filter.name=Miep', // default operator
      'filter.name[eq]=miep', // different casing, still matches
    ]) {
      await createData(tembaServer, [
        { name: 'Piet', age: 24 },
        { name: 'Miep', age: 23 },
      ])

      const deleteRes = await request(tembaServer).delete(resource).query(queryString)
      expectSuccess(deleteRes)

      const getRemaining = await request(tembaServer).get(resource)
      expect(getRemaining.body.length).toEqual(1)
      expect(getRemaining.body[0].name).toEqual('Piet')

      // Clean up before next loop iteration
      await request(tembaServer).delete(resource)
    }
  })

  test('Delete using [eq] operator with multiple filters', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 24 },
      { name: 'Miep', age: 23 },
    ])

    await request(tembaServer).delete(resource).query('filter.name[eq]=Miep&filter.age[eq]=23')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
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

  test('Filter on a field that only exists on some items deletes only matching items', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 24 },
      { name: 'Miep' }, // no age field
    ])

    const deleteRes = await request(tembaServer).delete(resource).query('filter.age[eq]=24')
    expectSuccess(deleteRes)

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Miep')
  })

  test('Delete using [eq] operator on accented characters', async () => {
    await createData(tembaServer, [{ name: 'Chloé' }, { name: 'Chloe' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=Chloé')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Chloe')
  })

  test('Delete using [eq] operator is case-insensitive', async () => {
    await createData(tembaServer, [{ name: 'Piet' }, { name: 'Miep' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=MIEP')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete using [neq] operator is case-insensitive', async () => {
    await createData(tembaServer, [{ name: 'Piet' }, { name: 'Miep' }])

    await request(tembaServer).delete(resource).query('filter.name[neq]=MIEP')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Miep')
  })

  test('Delete using [neq] operator on boolean field', async () => {
    await createData(tembaServer, [
      { name: 'Piet', isActive: true },
      { name: 'Miep', isActive: true },
      { name: 'Kees', isActive: false },
    ])

    await request(tembaServer).delete(resource).query('filter.isActive[neq]=false')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Kees')
  })

  test('Delete using [eq] operator on CJK characters', async () => {
    await createData(tembaServer, [{ name: '孫悟空' }, { name: 'Other' }])

    await request(tembaServer).delete(resource).query('filter.name[eq]=孫悟空')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Other')
  })

  test('Delete using [eq] operator with URL-encoded accented characters', async () => {
    await createData(tembaServer, [{ name: 'Chloé' }, { name: 'Chloe' }])

    // %C3%A9 is the UTF-8 percent-encoding of 'é'
    await request(tembaServer).delete(resource).query('filter.name[eq]=Chlo%C3%A9')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Chloe')
  })
})

describe('String partial matching operators: startsWith, endsWith, contains', () => {
  test('Delete using [contains] operator', async () => {
    await createData(tembaServer, [
      { description: 'lorem ipsum dolor' },
      { description: 'hello world' },
      { description: 'Lorem Ipsum' },
    ])

    await request(tembaServer).delete(resource).query('filter.description[contains]=lorem')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].description).toEqual('hello world')
  })

  test('[contains] is case-insensitive', async () => {
    await createData(tembaServer, [{ name: 'FooBar' }, { name: 'foobar' }, { name: 'baz' }])

    await request(tembaServer).delete(resource).query('filter.name[contains]=OOB')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('baz')
  })

  test('Delete using [startsWith] operator', async () => {
    await createData(tembaServer, [
      { username: 'admin_alice' },
      { username: 'Admin_Bob' },
      { username: 'user_charlie' },
    ])

    await request(tembaServer).delete(resource).query('filter.username[startsWith]=admin')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].username).toEqual('user_charlie')
  })

  test('[startsWith] is case-insensitive', async () => {
    await createData(tembaServer, [{ name: 'FooBar' }, { name: 'foobar' }, { name: 'baz' }])

    await request(tembaServer).delete(resource).query('filter.name[startsWith]=FOO')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('baz')
  })

  test('Delete using [endsWith] operator', async () => {
    await createData(tembaServer, [
      { email: 'alice@example.com' },
      { email: 'bob@example.com' },
      { email: 'charlie@other.org' },
    ])

    await request(tembaServer).delete(resource).query('filter.email[endsWith]=@example.com')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].email).toEqual('charlie@other.org')
  })

  test('[endsWith] is case-insensitive', async () => {
    await createData(tembaServer, [{ name: 'FooBar' }, { name: 'fooBAR' }, { name: 'baz' }])

    await request(tembaServer).delete(resource).query('filter.name[endsWith]=BAR')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('baz')
  })

  test('[contains] on a non-string field deletes nothing', async () => {
    await createData(tembaServer, [{ active: true }, { active: false }, { year: 2024 }])

    await request(tembaServer).delete(resource).query('filter.active[contains]=rue')
    const afterBool = await request(tembaServer).get(resource)
    expect(afterBool.body.length).toEqual(3)

    await request(tembaServer).delete(resource).query('filter.year[contains]=202')
    const afterNum = await request(tembaServer).get(resource)
    expect(afterNum.body.length).toEqual(3)
  })

  test('[startsWith] returns no results when no match (nothing deleted)', async () => {
    await createData(tembaServer, [{ name: 'Alice' }, { name: 'Bob' }])

    await request(tembaServer).delete(resource).query('filter.name[startsWith]=xyz')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
  })

  test('[endsWith] returns no results when no match (nothing deleted)', async () => {
    await createData(tembaServer, [{ name: 'Alice' }, { name: 'Bob' }])

    await request(tembaServer).delete(resource).query('filter.name[endsWith]=xyz')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
  })
})

describe('Number and date filtering ([gt], [gte], [lt], [lte])', () => {
  test('Delete using [gt] operator on integers', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 17 },
      { name: 'Miep', age: 18 },
      { name: 'Kees', age: 25 },
    ])

    await request(tembaServer).delete(resource).query('filter.age[gt]=18')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
    expect(getRemaining.body.map((item: { name: string }) => item.name).sort()).toEqual([
      'Miep',
      'Piet',
    ])
  })

  test('Delete using [gte] operator on integers', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 17 },
      { name: 'Miep', age: 18 },
      { name: 'Kees', age: 25 },
    ])

    await request(tembaServer).delete(resource).query('filter.age[gte]=18')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete using [lt] operator on integers', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 17 },
      { name: 'Miep', age: 18 },
      { name: 'Kees', age: 25 },
    ])

    await request(tembaServer).delete(resource).query('filter.age[lt]=18')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
    expect(getRemaining.body.map((item: { name: string }) => item.name).sort()).toEqual([
      'Kees',
      'Miep',
    ])
  })

  test('Delete using [lte] operator on integers', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 17 },
      { name: 'Miep', age: 18 },
      { name: 'Kees', age: 25 },
    ])

    await request(tembaServer).delete(resource).query('filter.age[lte]=18')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Kees')
  })

  test('Delete using [gt] and [lt] as a range query on the same field', async () => {
    await createData(tembaServer, [
      { name: 'Piet', age: 17 },
      { name: 'Miep', age: 25 },
      { name: 'Kees', age: 40 },
    ])

    await request(tembaServer).delete(resource).query('filter.age[gt]=18&filter.age[lt]=35')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
    expect(getRemaining.body.map((item: { name: string }) => item.name).sort()).toEqual([
      'Kees',
      'Piet',
    ])
  })

  test('Delete using [lte] on decimal (float) values', async () => {
    await createData(tembaServer, [
      { product: 'Apple', price: 0.99 },
      { product: 'Banana', price: 1.49 },
      { product: 'Cherry', price: 2.99 },
    ])

    await request(tembaServer).delete(resource).query('filter.price[lte]=1.49')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].product).toEqual('Cherry')
  })

  test('Delete using [gt] on decimal (float) values', async () => {
    await createData(tembaServer, [
      { product: 'Apple', price: 0.99 },
      { product: 'Banana', price: 1.49 },
      { product: 'Cherry', price: 2.99 },
    ])

    await request(tembaServer).delete(resource).query('filter.price[gt]=1.49')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
    expect(getRemaining.body.map((item: { product: string }) => item.product).sort()).toEqual([
      'Apple',
      'Banana',
    ])
  })

  test('Delete using [gt] on ISO 8601 date strings', async () => {
    await createData(tembaServer, [
      { name: 'Piet', birthday: '1990-05-15' },
      { name: 'Miep', birthday: '2001-11-03' },
      { name: 'Kees', birthday: '2010-07-22' },
    ])

    await request(tembaServer).delete(resource).query('filter.birthday[gt]=2000-01-01')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Piet')
  })

  test('Delete using [lte] on ISO 8601 date strings', async () => {
    await createData(tembaServer, [
      { name: 'Piet', birthday: '1990-05-15' },
      { name: 'Miep', birthday: '2001-11-03' },
      { name: 'Kees', birthday: '2010-07-22' },
    ])

    await request(tembaServer).delete(resource).query('filter.birthday[lte]=2001-11-03')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(1)
    expect(getRemaining.body[0].name).toEqual('Kees')
  })

  test('Delete using [gt] and [lte] as a date range query', async () => {
    await createData(tembaServer, [
      { name: 'Piet', birthday: '1990-05-15' },
      { name: 'Miep', birthday: '2001-11-03' },
      { name: 'Kees', birthday: '2010-07-22' },
    ])

    await request(tembaServer)
      .delete(resource)
      .query('filter.birthday[gt]=1995-01-01&filter.birthday[lte]=2005-01-01')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
    expect(getRemaining.body.map((item: { name: string }) => item.name).sort()).toEqual([
      'Kees',
      'Piet',
    ])
  })

  test('[gt] on a non-number, non-string field deletes nothing', async () => {
    await createData(tembaServer, [
      { name: 'Piet', score: null },
      { name: 'Miep', score: null },
    ])

    await request(tembaServer).delete(resource).query('filter.score[gt]=0')

    const getRemaining = await request(tembaServer).get(resource)
    expect(getRemaining.body.length).toEqual(2)
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
      'filter.name[eq]=Piet&filter.name[eq]=Miep', // Repeated param produces array RHS
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
