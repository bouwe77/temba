import type { Item } from '../data/types'
import type { MaybePromise } from '../types'

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

export type ResponseBodyInterceptor = (info: InterceptedResponse) => MaybePromise<unknown>
