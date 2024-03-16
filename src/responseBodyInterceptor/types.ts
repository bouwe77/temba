import { Item } from '../queries/types'

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

export type ResponseBodyInterceptor = (info: InterceptedResponse) => unknown
