import request from 'supertest'
import type { Express } from 'express'

export type Method = 'get' | 'head' | 'post' | 'put' | 'patch' | 'delete'

export type TestResponse = {
  text: string
  body: unknown
  statusCode: number
  headers: Record<string, string> | Headers
}

const sendSupertestRequest = async (
  server: Express,
  method: Method,
  resource: string,
  body?: object,
) => {
  let theRequest = request(server)[method](resource)

  if (body) {
    theRequest = theRequest.send(body)
  }

  const response = await theRequest
  return {
    text: response.text,
    body: response.body,
    statusCode: response.statusCode,
    headers: response.headers,
  } satisfies TestResponse
}

const sendHttpRequest = async (method: Method, resource: string, body?: object) => {
  const options: RequestInit = {
    method,
  }

  if (body) {
    options.headers = {
      'Content-Type': 'application/json',
    }
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`http://localhost:4321${resource}`, options)

  const text = await response.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch (error) {
    json = null
  }
  return {
    text,
    body: json,
    statusCode: response.status,
    headers: response.headers,
  } satisfies TestResponse
}

export const sendRequest = async (
  server: Express,
  method: Method,
  resource: string,
  body?: object,
) => {
  const e2e = process.env.E2E

  if (e2e) {
    return sendHttpRequest(method, resource, body) satisfies Promise<TestResponse>
  } else {
    return sendSupertestRequest(server, method, resource, body) satisfies Promise<TestResponse>
  }
}
