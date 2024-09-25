import { describe, test, expect } from 'vitest'
import type { UserConfig } from '../../../src/config'
import createServer from '../createServer'
import type { RequestInterceptor } from '../../../src/requestInterceptor/types'
import { sendRequest } from '../../sendRequest'

describe('requestInterceptors does not return an object', () => {
  const getResponse = (resource: string | null) => {
    if (resource === 'return-number') return 1
    if (resource === 'return-array') return [1, 2, 3]
    if (resource === 'return-boolean') return true
    return {}
  }

  const requestInterceptor: RequestInterceptor = {
    post: ({ resource }) => {
      return getResponse(resource)
    },
    put: ({ resource }) => {
      return getResponse(resource)
    },
    patch: ({ resource }) => {
      return getResponse(resource)
    },
  }

  const tembaServer = createServer({ requestInterceptor } satisfies UserConfig)

  test('requestInterceptor returns the original request body when something else than an object or string is returned', async () => {
    // Send POST requests.
    let response = await sendRequest(tembaServer, 'post', '/return-number', { name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const numberId = response.headers['location']?.split('/').pop()

    response = await sendRequest(tembaServer, 'post', '/return-array', { name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const arrayId = response.headers['location']?.split('/').pop()

    response = await sendRequest(tembaServer, 'post', '/return-boolean', { name: 'Jane' })
    expect(response.statusCode).toEqual(201)
    expect(response.body.name).toEqual('Jane')

    const booleanId = response.headers['location']?.split('/').pop()

    // Send PUT requests.
    response = await sendRequest(tembaServer, 'put', '/return-number/' + numberId, { name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await sendRequest(tembaServer, 'put', '/return-array/' + arrayId, { name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await sendRequest(tembaServer, 'put', '/return-boolean/' + booleanId, {
      name: 'Jane',
    })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    // Send PATCH requests.
    response = await sendRequest(tembaServer, 'patch', '/return-number/' + numberId, {
      name: 'Jane',
    })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await sendRequest(tembaServer, 'patch', '/return-array/' + arrayId, { name: 'Jane' })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')

    response = await sendRequest(tembaServer, 'patch', '/return-boolean/' + booleanId, {
      name: 'Jane',
    })
    expect(response.statusCode).toEqual(200)
    expect(response.body.name).toEqual('Jane')
  })
})
