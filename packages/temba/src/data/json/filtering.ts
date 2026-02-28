import {
  supportedOperators,
  type Filter,
  type NestedFilter,
  type Operator,
  type OperatorObject,
} from '../../filtering/filter'

const operatorFns: Record<Operator, (a: unknown, b: string) => boolean> = {
  eq: (a, b) => {
    if (typeof a === 'string') {
      return a.toLowerCase() === b.toLowerCase()
    }
    if (typeof a === 'number') {
      return a === Number(b)
    }
    if (typeof a === 'boolean') {
      return a === (b.toLowerCase() === 'true')
    }
    return a === b
  },

  neq: (a, b) => {
    if (typeof a === 'string') {
      return a.toLowerCase() !== b.toLowerCase()
    }
    if (typeof a === 'number') {
      return a !== Number(b)
    }
    if (typeof a === 'boolean') {
      return a !== (b.toLowerCase() === 'true')
    }
    return a !== b
  },
}

const isOperatorObject = (obj: unknown): obj is OperatorObject => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    Object.keys(obj).some((k) => supportedOperators.includes(k as Operator))
  )
}

const matchesFilter = (obj: Record<string, unknown>, spec: NestedFilter): boolean => {
  return Object.entries(spec).every(([key, constraint]) => {
    const v = obj[key]

    if (isOperatorObject(constraint)) {
      return (Object.keys(constraint) as Operator[]).every((op) => {
        const rhs = constraint[op]
        return rhs !== undefined && operatorFns[op]?.(v, rhs)
      })
    } else {
      if (typeof v !== 'object' || v === null) return false
      return matchesFilter(v as Record<string, unknown>, constraint)
    }
  })
}

export const makePredicate = <T extends Record<string, unknown>>(f: Filter) => {
  return (item: T) => matchesFilter(item, f.filter)
}
