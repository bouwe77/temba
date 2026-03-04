import type { Filter, NestedFilter, Operator, OperatorObject } from '../../filtering/filter'
import { supportedOperators } from '../../filtering/filter'

type MongoCondition = Record<string, unknown>

const buildOperatorCondition = (op: Operator, raw: string): MongoCondition => {
  // eq and neq use case-insensitive regex for string semantics
  if (op === 'eq') {
    return { $regex: new RegExp(`^${escapeRegex(raw)}$`, 'i') }
  }

  if (op === 'neq') {
    return { $not: new RegExp(`^${escapeRegex(raw)}$`, 'i') }
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
  if (op === 'gt') return { $gt: raw }
  if (op === 'gte') return { $gte: raw }
  if (op === 'lt') return { $lt: raw }
  if (op === 'lte') return { $lte: raw }

  // exists value is guaranteed to be "true" or "false" by shared validation
  if (op === 'exists') return { $exists: raw.toLowerCase() === 'true' }

  if (op === 'regex') return { $regex: new RegExp(raw) }

  // in / nin: use raw string values for consistent string semantics
  const values = raw.split(',').map((v) => v.trim())

  if (op === 'in') {
    return { $in: values.map((v) => new RegExp(`^${escapeRegex(v)}$`, 'i')) }
  }

  // nin
  return { $nin: values.map((v) => new RegExp(`^${escapeRegex(v)}$`, 'i')) }
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
