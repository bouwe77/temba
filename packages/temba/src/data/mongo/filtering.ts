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

  // eq and neq use case-insensitive regex for string semantics
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

  // contains, startsWith, endsWith are string-only.
  // For non-string fields $regex on a non-string MongoDB field naturally returns no match.
  if (op === 'contains') {
    return { $regex: new RegExp(escapeRegex(raw), 'i') }
  }

  if (op === 'startsWith') {
    return { $regex: new RegExp(`^${escapeRegex(raw)}`, 'i') }
  }

  if (op === 'endsWith') {
    return { $regex: new RegExp(`${escapeRegex(raw)}$`, 'i') }
  }

  // Range operators use raw string — lexicographic comparison as documented.
  // MongoDB's native BSON ordering handles numeric fields stored as numbers correctly.
  if (op === 'gt') return { $gt: coerced }
  if (op === 'gte') return { $gte: coerced }
  if (op === 'lt') return { $lt: coerced }
  if (op === 'lte') return { $lte: coerced }

  // exists value is guaranteed to be "true" or "false" by shared validation
  if (op === 'exists') return { $exists: coerced }

  if (op === 'regex') return { $regex: new RegExp(raw) }

  // in / nin / all: use case-insensitive regexes for all-string lists, otherwise coerce.
  const values = raw.split(',').map((v) => v.trim())
  const coercedValues = values.map(coerceValue)
  const allStrings = coercedValues.every((value) => typeof value === 'string')

  if (op === 'in') {
    if (allStrings) {
      return { $in: coercedValues.map((v) => new RegExp(`^${escapeRegex(String(v))}$`, 'i')) }
    }
    return { $in: coercedValues }
  }

  if (op === 'all') {
    if (allStrings) {
      return { $all: coercedValues.map((v) => new RegExp(`^${escapeRegex(String(v))}$`, 'i')) }
    }
    return { $all: coercedValues }
  }

  // nin
  if (allStrings) {
    return { $nin: coercedValues.map((v) => new RegExp(`^${escapeRegex(String(v))}$`, 'i')) }
  }
  return { $nin: coercedValues }
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
