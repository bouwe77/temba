type RawFilter = {
  filter: Record<string, unknown>
}

export const supportedOperators = ['eq', 'neq', 'ieq', 'ineq'] as const
/** @internal */
export type Operator = (typeof supportedOperators)[number]
/** @internal */
export type OperatorMap = Record<Operator, string>

type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>
}[keyof T]

/** @internal */
export type OperatorObject = ExactlyOne<OperatorMap>

/** @internal */
export type NestedFilter = {
  [Key: string]: OperatorObject | NestedFilter
}

/** @internal */
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

/**
 * Walks the filter object recursively. At depth > 1 (inside a field's value),
 * any key pointing to a string is in operator position and must be a valid
 * supported operator (exact case-sensitive match).
 */
const hasValidOperators = (node: Record<string, unknown>, depth: number): boolean => {
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      if (depth > 1 && !supportedOperators.includes(key as Operator)) {
        return false
      }
    } else if (Array.isArray(value)) {
      return false
    } else if (isObject(value)) {
      if (!hasValidOperators(value, depth + 1)) {
        return false
      }
    }
  }
  return true
}

type FilterValidationResult = 'valid' | 'invalid' | 'missing'

export const validateFilter = (input: unknown): FilterValidationResult => {
  // 1. If it's not an object, it can't possess properties, so it's missing.
  if (!isObject(input)) {
    return 'missing'
  }

  // 2. Check for the exact lowercase "filter" property
  if ('filter' in input) {
    const value = input.filter

    // Check if the value is a non-array object
    if (!isObject(value) || Array.isArray(value)) {
      return 'invalid'
    }

    // Check that all operator keys are valid supported operators
    if (!hasValidOperators(value, 1)) {
      return 'invalid'
    }

    return 'valid'
  }

  // 3. Check for any case-insensitive variation (e.g., "Filter", "FILTER")
  if (Object.keys(input).some((key) => key.toLowerCase() === 'filter')) {
    return 'invalid'
  }

  // 4. If no "filter" (any case) exists
  return 'missing'
}

export const prepareFilter = (rawFilter: RawFilter): Filter =>
  addDefaultEqOperatorWhenNoOperator(rawFilter)
