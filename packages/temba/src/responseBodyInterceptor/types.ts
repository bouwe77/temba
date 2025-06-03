import type { Item } from '../data/types'

export type InterceptedResponse =
  | {
      body: Item
      resource: string
      id: string
    }
  | {
      body: Item[]
      resource: string
    }

export type ResponseBodyInterceptor = (response: InterceptedResponse) => unknown
