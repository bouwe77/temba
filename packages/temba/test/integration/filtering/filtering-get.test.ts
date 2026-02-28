// @mongodb
/* filtering-get.test.ts */
import { Server } from 'http'
import request from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { createServer } from '../createServer'
import { expectSuccess } from '../helpers'

/*
    Tests filtering GET requests via query strings.
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
  tembaServer = await createServer()
})

describe('String exact match operators: eq and neq', () => {
  test('No filtering when no filter is provided', async () => {
    const data = [{ firstName: 'Piet' }, { fIrStNaMe: 'Kees' }, { firstName: 'Miep' }]
    await createData(tembaServer, data)

    // Get all resources without filtering
    const getAllResponse = await request(tembaServer).get(resource)
    expect(getAllResponse.body.length).toEqual(3)
    expect(getAllResponse.body).toEqual(
      expect.arrayContaining(data.map((item) => expect.objectContaining(item))),
    )
  })

  test('Unknown field names or incorrectly cased field names return 0 results', async () => {
    const data = [{ firstName: 'Piet' }, { fIrStNaMe: 'Kees' }, { firstName: 'Miep' }]
    await createData(tembaServer, data)

    // Unknown field names should not return any results
    const getUnknownFieldResponse = await request(tembaServer)
      .get(resource)
      .query('filter.unknownField[eq]=Miep')
    expect(getUnknownFieldResponse.body.length).toEqual(0)

    // Field names are case sensitive, so incorrect casing is considered an unknown field
    const getFilterResponse = await request(tembaServer)
      .get(resource)
      .query('filter.FIRSTname[eq]=Miep')
    expect(getFilterResponse.body.length).toEqual(0)

    // Exact casing matches correctly
    const getFilterResponse4 = await request(tembaServer)
      .get(resource)
      .query('filter.fIrStNaMe[eq]=Kees')
    expect(getFilterResponse4.body.length).toEqual(1)
    expect(getFilterResponse4.body[0].fIrStNaMe).toEqual('Kees')
  })

  test('Filter using [eq] operator (case-insensitive equals)', async () => {
    const data = [
      { name: 'Piet', age: 24, isActive: true },
      { name: 'Miep', age: 23, isActive: false },
      { name: 'miep', age: 99, isActive: true },
    ]
    await createData(tembaServer, data)

    // Both 'Miep' and 'miep' should match case-insensitively
    for (const queryString of [
      'filter.name[eq]=Miep',
      'filter.name=Miep', // No operator defaults to [eq]
      'filter.name[eq]=miep',
    ]) {
      const getFilterResponse = await request(tembaServer).get(resource).query(queryString)
      expect(getFilterResponse.body.length).toEqual(2)
      expect(getFilterResponse.body.map((item: { name: string }) => item.name).sort()).toEqual(
        ['Miep', 'miep'].sort(),
      )
    }

    // Multiple filters combined
    const getFilterResponse = await request(tembaServer)
      .get(resource)
      .query('filter.name[eq]=Miep&filter.age[eq]=23')
    expect(getFilterResponse.body.length).toEqual(1)
    expect(getFilterResponse.body[0].name).toEqual('Miep')
  })

  test('Empty filter value using [eq] operator', async () => {
    const data = [
      { name: 'Piet', age: 21 },
      { name: '', age: 77 },
    ]
    await createData(tembaServer, data)

    const getResponse = await request(tembaServer).get(resource).query('filter.name[eq]=')
    expect(getResponse.body.length).toEqual(1)
    expect(getResponse.body[0].name).toEqual('')
    expect(getResponse.body[0].age).toEqual(77)
  })

  test('Filter using [neq] operator', async () => {
    const data = [
      { name: 'Piet', isActive: true },
      { name: 'Miep', isActive: true },
      { name: '', isActive: false },
    ]
    await createData(tembaServer, data)

    // Case-insensitive filter for not finding 'Miep' (also excludes 'miep' variants)
    const queryString = 'filter.name[neq]=Miep'
    const getFilterResponse = await request(tembaServer).get(resource).query(queryString)
    expect(getFilterResponse.body.length).toEqual(2)
    expect(getFilterResponse.body.map((item: { name: string }) => item.name)).toEqual(
      expect.arrayContaining(['Piet', '']),
    )

    // Filter using [neq] operator on boolean
    const getFilterResponse2 = await request(tembaServer)
      .get(resource)
      .query('filter.isActive[neq]=true')
    expect(getFilterResponse2.body.length).toEqual(1)
    expect(getFilterResponse2.body.map((item: { name: string }) => item.name)).toEqual([''])
  })

  test("Filter on both [eq] and [neq] operators that don't give any results", async () => {
    const data = [
      { name: 'Piet', age: 23, isActive: true },
      { name: 'Miep', age: 45, isActive: false },
    ]
    await createData(tembaServer, data)

    for (const queryString of [
      'filter.name[eq]=Piet&filter.age[eq]=45',
      'filter.name[eq]=Miep&filter.age[neq]=45',
      'filter.name[eq]=Miep&filter.isActive[neq]=false',
      'filter.name[eq]=Miep&filter.age[eq]=21&filter.isActive[neq]=true',
    ]) {
      const getResponse = await request(tembaServer).get(resource).query(queryString)
      expect(getResponse.body.length).toEqual(0)
    }
  })

  test('Filter handling of null values', async () => {
    const data = [
      { name: 'Piet', value: null },
      { name: 'Miep', value: 'null' },
    ]
    await createData(tembaServer, data)

    const getResponse = await request(tembaServer).get(resource).query('filter.value[eq]=null')
    expect(getResponse.body.length).toEqual(1)
    expect(getResponse.body[0].name).toEqual('Miep')
  })

  test('Filter handling of URL encoded special characters', async () => {
    const data = [
      { name: 'John Doe', age: 30 },
      { name: 'A&B', age: 40 },
      { name: 'C=D', age: 50 },
    ]
    await createData(tembaServer, data)

    const spaceRes = await request(tembaServer).get(resource).query('filter.name[eq]=John%20Doe')
    expect(spaceRes.body.length).toEqual(1)
    expect(spaceRes.body[0].name).toEqual('John Doe')

    const ampRes = await request(tembaServer).get(resource).query('filter.name[eq]=A%26B')
    expect(ampRes.body.length).toEqual(1)
    expect(ampRes.body[0].name).toEqual('A&B')

    const eqRes = await request(tembaServer).get(resource).query('filter.name[eq]=C%3DD')
    expect(eqRes.body.length).toEqual(1)
    expect(eqRes.body[0].name).toEqual('C=D')
  })

  test('Filter integrates safely with other query parameters', async () => {
    const data = [
      { name: 'Piet', age: 24 },
      { name: 'Piet', age: 30 },
      { name: 'Miep', age: 23 },
    ]
    await createData(tembaServer, data)

    const getResponse = await request(tembaServer)
      .get(resource)
      .query('filter.name[eq]=Piet&limit=1&sort=age')

    expect(getResponse.body.length).toBeGreaterThan(0)
    expect(getResponse.body.every((item: { name: string }) => item.name === 'Piet')).toBe(true)
  })

  test('Filter on a field that only exists on some items', async () => {
    const data = [
      { name: 'Piet', age: 24 },
      { name: 'Miep' }, // no age field
    ]
    await createData(tembaServer, data)

    const getResponse = await request(tembaServer).get(resource).query('filter.age[eq]=24')
    expect(getResponse.body.length).toEqual(1)
    expect(getResponse.body[0].name).toEqual('Piet')
  })

  test('Filter using [eq] operator on accented characters', async () => {
    const data = [{ name: 'Chloé' }, { name: 'Chloe' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[eq]=Chloé')
    expect(res.body.length).toEqual(1)
    expect(res.body[0].name).toEqual('Chloé')
  })

  test('Filter using [eq] operator on CJK characters', async () => {
    const data = [{ name: '孫悟空' }, { name: 'Other' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[eq]=孫悟空')
    expect(res.body.length).toEqual(1)
    expect(res.body[0].name).toEqual('孫悟空')
  })

  test('Filter using [eq] operator with URL-encoded accented characters', async () => {
    const data = [{ name: 'Chloé' }, { name: 'Chloe' }]
    await createData(tembaServer, data)

    // %C3%A9 is the UTF-8 percent-encoding of 'é'
    const res = await request(tembaServer).get(resource).query('filter.name[eq]=Chlo%C3%A9')
    expect(res.body.length).toEqual(1)
    expect(res.body[0].name).toEqual('Chloé')
  })
})

describe('HEAD', () => {
  test('HEAD with valid filter returns 200', async () => {
    await createData(tembaServer, [{ name: 'Piet' }, { name: 'Miep' }])

    const response = await request(tembaServer).head(resource).query('filter.name[eq]=Piet')
    expect(response.status).toBe(200)
  })

  test('HEAD with valid filter that matches nothing still returns 200', async () => {
    await createData(tembaServer, [{ name: 'Piet' }])

    const response = await request(tembaServer).head(resource).query('filter.name[eq]=Unknown')
    expect(response.status).toBe(200)
  })
})

describe('Unhappy paths (400 Bad Request)', () => {
  test('Returns 400 Bad Request for malformed expressions', async () => {
    const badRequests = [
      'FILTER.firstName[eq]=Miep', // Bad keyword casing
      'filter.firstName[EQ]=Miep', // Bad operator casing
      'filter.firstName[invalid]=Miep', // Unsupported operator
      'filter.firstName[eq=Miep', // Malformed brackets
      'filter.firstName[eq]=Miep&filter.firstName[eq]=Kees', // Repeated param produces array RHS
      'filter.name=Piet&filter.name[neq]=PIET', // Mixed bare+bracket on same field produces array RHS
    ]

    for (const queryString of badRequests) {
      const response = await request(tembaServer).get(resource).query(queryString)

      expect(response.status).toBe(400)
    }
  })

  test('Returns 400 Bad Request for HEAD request with malformed filter', async () => {
    const badRequests = [
      'FILTER.name[eq]=Piet',
      'filter.name[EQ]=Piet',
      'filter.name[invalid]=Piet',
      'filter.name[eq=Piet',
    ]

    for (const queryString of badRequests) {
      const response = await request(tembaServer).head(resource).query(queryString)
      expect(response.status).toBe(400)
    }
  })

  test('Returns 400 Bad Request when attempting to filter a single-resource HEAD by ID', async () => {
    const data = [{ name: 'Piet' }]
    await createData(tembaServer, data)

    const getAllResponse = await request(tembaServer).get(resource)
    const itemId = getAllResponse.body[0].id

    const response = await request(tembaServer)
      .head(`${resource}/${itemId}`)
      .query('filter.name[eq]=Piet')

    expect(response.status).toBe(400)
  })

  test('Returns 400 Bad Request when attempting to filter a single-resource GET by ID', async () => {
    // Create at least one resource to get an ID
    const data = [{ name: 'Piet' }]
    await createData(tembaServer, data)

    // Fetch the item to get its generated ID
    const getAllResponse = await request(tembaServer).get(resource)
    const itemId = getAllResponse.body[0].id

    // Attempt to GET the specific item by ID, but include a filter
    const response = await request(tembaServer)
      .get(`${resource}/${itemId}`)
      .query('filter.name[eq]=Piet')

    expect(response.status).toBe(400)
  })
})

describe('String partial matching operators: startsWith, endsWith, contains', () => {
  test('Filter using [contains] operator', async () => {
    const data = [
      { description: 'lorem ipsum dolor' },
      { description: 'hello world' },
      { description: 'Lorem Ipsum' },
    ]
    await createData(tembaServer, data)

    // Case-insensitive substring match
    const res = await request(tembaServer).get(resource).query('filter.description[contains]=lorem')
    expect(res.body.length).toEqual(2)
    expect(res.body.map((i: { description: string }) => i.description).sort()).toEqual([
      'Lorem Ipsum',
      'lorem ipsum dolor',
    ])
  })

  test('Filter using [startsWith] operator', async () => {
    const data = [
      { username: 'admin_alice' },
      { username: 'Admin_Bob' },
      { username: 'user_charlie' },
    ]
    await createData(tembaServer, data)

    // Case-insensitive prefix match
    const res = await request(tembaServer).get(resource).query('filter.username[startsWith]=admin')
    expect(res.body.length).toEqual(2)
    expect(res.body.map((i: { username: string }) => i.username).sort()).toEqual([
      'Admin_Bob',
      'admin_alice',
    ])
  })

  test('Filter using [endsWith] operator', async () => {
    const data = [
      { email: 'alice@example.com' },
      { email: 'bob@example.com' },
      { email: 'charlie@other.org' },
    ]
    await createData(tembaServer, data)

    // Case-insensitive suffix match
    const res = await request(tembaServer)
      .get(resource)
      .query('filter.email[endsWith]=@example.com')
    expect(res.body.length).toEqual(2)
    expect(res.body.map((i: { email: string }) => i.email).sort()).toEqual([
      'alice@example.com',
      'bob@example.com',
    ])
  })

  test('[contains] is case-insensitive', async () => {
    const data = [{ name: 'FooBar' }, { name: 'foobar' }, { name: 'baz' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[contains]=OOB')
    expect(res.body.length).toEqual(2)
  })

  test('[startsWith] is case-insensitive', async () => {
    const data = [{ name: 'FooBar' }, { name: 'foobar' }, { name: 'baz' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[startsWith]=FOO')
    expect(res.body.length).toEqual(2)
  })

  test('[endsWith] is case-insensitive', async () => {
    const data = [{ name: 'FooBar' }, { name: 'fooBAR' }, { name: 'baz' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[endsWith]=BAR')
    expect(res.body.length).toEqual(2)
  })

  test('[contains] on a non-string field returns no results', async () => {
    const data = [{ active: true }, { active: false }, { year: 2024 }]
    await createData(tembaServer, data)

    const boolRes = await request(tembaServer).get(resource).query('filter.active[contains]=rue')
    expect(boolRes.body.length).toEqual(0)

    const numRes = await request(tembaServer).get(resource).query('filter.year[contains]=202')
    expect(numRes.body.length).toEqual(0)
  })

  test('[startsWith] returns no results when no match', async () => {
    const data = [{ name: 'Alice' }, { name: 'Bob' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[startsWith]=xyz')
    expect(res.body.length).toEqual(0)
  })

  test('[endsWith] returns no results when no match', async () => {
    const data = [{ name: 'Alice' }, { name: 'Bob' }]
    await createData(tembaServer, data)

    const res = await request(tembaServer).get(resource).query('filter.name[endsWith]=xyz')
    expect(res.body.length).toEqual(0)
  })
})
