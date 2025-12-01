import type { Item } from '../data/types'

type MaybePromise<T> = T | Promise<T>

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
