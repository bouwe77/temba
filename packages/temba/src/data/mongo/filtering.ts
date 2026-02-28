import type { Filter, NestedFilter, Operator, OperatorObject } from '../../filtering/filter'
import { supportedOperators } from '../../filtering/filter'

type MongoCondition = Record<string, unknown>

const coerceValue = (value: string): string | number | boolean => {
  const asNumber = Number(value)
  if (value !== '' && !isNaN(asNumber)) return asNumber

  const lower = value.toLowerCase()
  if (lower === 'true') return true
  if (lower === 'false') return false

  return value
}

const buildOperatorCondition = (op: Operator, raw: string): MongoCondition => {
  const coerced = coerceValue(raw)

  if (op === 'eq') {
    if (typeof coerced === 'string') {
      return { $regex: new RegExp(`^${escapeRegex(coerced)}$`, 'i') }
    }
    return { $eq: coerced }
  }

  if (op === 'neq') {
    if (typeof coerced === 'string') {
      return { $not: new RegExp(`^${escapeRegex(coerced)}$`, 'i') }
    }
    return { $ne: coerced }
  }

  const str = String(coerced)

  if (op === 'contains') {
    return { $regex: new RegExp(escapeRegex(str), 'i') }
  }

  if (op === 'startsWith') {
    return { $regex: new RegExp(`^${escapeRegex(str)}`, 'i') }
  }

  // endsWith
  return { $regex: new RegExp(`${escapeRegex(str)}$`, 'i') }
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isOperatorObject = (obj: unknown): obj is OperatorObject =>
  obj !== null &&
  typeof obj === 'object' &&
  Object.keys(obj).some((k) => supportedOperators.includes(k as Operator))

const collectConditions = (
  spec: NestedFilter,
  path: string,
  conditions: MongoCondition[],
): void => {
  for (const [key, value] of Object.entries(spec)) {
    const fieldPath = path ? `${path}.${key}` : key

    if (isOperatorObject(value)) {
      for (const op of Object.keys(value) as Operator[]) {
        const raw = (value as unknown as Record<string, string>)[op]
        if (raw !== undefined) {
          conditions.push({ [fieldPath]: buildOperatorCondition(op, raw) })
        }
      }
    } else {
      collectConditions(value as NestedFilter, fieldPath, conditions)
    }
  }
}

export const buildMongoQuery = (filter: Filter): Record<string, unknown> => {
  const conditions: MongoCondition[] = []
  collectConditions(filter.filter, '', conditions)

  if (conditions.length === 0) return {}
  if (conditions.length === 1) return conditions[0] as Record<string, unknown>
  return { $and: conditions }
}
