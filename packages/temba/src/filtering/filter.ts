type RawFilter = {
  filter: Record<string, unknown>
}

export const supportedOperators = ['eq', 'neq'] as const
export type Operator = (typeof supportedOperators)[number]
export type OperatorMap = Record<Operator, string>

type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T]

export type OperatorObject = ExactlyOne<OperatorMap>

export type NestedFilter = {
  [Key: string]: OperatorObject | NestedFilter
}

export type Filter = {
  filter: NestedFilter
}

/**
 * Walks an arbitrary object and, at each leaf, wraps the value
 * in an `{ eq: string }` if it isn’t already an OperatorObject.
 */
const addDefaultEqOperatorWhenNoOperator = (raw: RawFilter): Filter => {
  const wrapEq = (node: unknown): OperatorObject | NestedFilter => {
    if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
      const obj = node as Record<string, unknown>
      const keys = Object.keys(obj)

      if (keys.some((k) => supportedOperators.includes(k as Operator))) {
        return obj as OperatorObject
      }

      const out: NestedFilter = {}
      for (const k of keys) {
        out[k] = wrapEq(obj[k])
      }
      return out
    }

    return { eq: String(node) }
  }

  return {
    filter: wrapEq(raw.filter) as NestedFilter,
  }
}

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
const hasFilterProp = (x: unknown): x is { filter: unknown } => isObject(x) && 'filter' in x

export const isValidFilter = (filter: unknown): filter is RawFilter => {
  if (!hasFilterProp(filter)) return false
  const inner = filter.filter
  const isValid = isObject(inner) && !Array.isArray(inner)
  return isValid
}

export const prepareFilter = (rawFilter: RawFilter): Filter =>
  addDefaultEqOperatorWhenNoOperator(rawFilter)
