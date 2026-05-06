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

  contains: (a, b) => typeof a === 'string' && a.toLowerCase().includes(b.toLowerCase()),

  startsWith: (a, b) => typeof a === 'string' && a.toLowerCase().startsWith(b.toLowerCase()),

  endsWith: (a, b) => typeof a === 'string' && a.toLowerCase().endsWith(b.toLowerCase()),

  gt: (a, b) => {
    if (typeof a === 'number') return a > Number(b)
    if (typeof a === 'string') return a > b
    return false
  },

  gte: (a, b) => {
    if (typeof a === 'number') return a >= Number(b)
    if (typeof a === 'string') return a >= b
    return false
  },

  lt: (a, b) => {
    if (typeof a === 'number') return a < Number(b)
    if (typeof a === 'string') return a < b
    return false
  },

  lte: (a, b) => {
    if (typeof a === 'number') return a <= Number(b)
    if (typeof a === 'string') return a <= b
    return false
  },

  in: (a, b) => {
    const values = b.split(',').map((v) => v.trim())
    return values.some((v) => {
      if (typeof a === 'string') return a.toLowerCase() === v.toLowerCase()
      if (typeof a === 'number') return a === Number(v)
      if (typeof a === 'boolean') return a === (v.toLowerCase() === 'true')
      return false
    })
  },

  nin: (a, b) => {
    const values = b.split(',').map((v) => v.trim())
    return values.every((v) => {
      if (typeof a === 'string') return a.toLowerCase() !== v.toLowerCase()
      if (typeof a === 'number') return a !== Number(v)
      if (typeof a === 'boolean') return a !== (v.toLowerCase() === 'true')
      return true
    })
  },

  // Array-aware handling for [all] lives in evaluateOperator.
  // Non-array fields should not match [all].
  all: () => false,

  exists: (a, b) => (b.toLowerCase() === 'true' ? a !== undefined : a === undefined),

  regex: (a, b) => typeof a === 'string' && new RegExp(b).test(a),
}

const matchesInList = (a: unknown, b: string) => {
  const values = b.split(',').map((v) => v.trim())

  return values.some((v) => {
    if (typeof a === 'string') return a.toLowerCase() === v.toLowerCase()
    if (typeof a === 'number') return a === Number(v)
    if (typeof a === 'boolean') return a === (v.toLowerCase() === 'true')
    return false
  })
}

const matchesNinList = (a: unknown, b: string) => {
  const values = b.split(',').map((v) => v.trim())

  return values.every((v) => {
    if (typeof a === 'string') return a.toLowerCase() !== v.toLowerCase()
    if (typeof a === 'number') return a !== Number(v)
    if (typeof a === 'boolean') return a !== (v.toLowerCase() === 'true')
    return true
  })
}

const matchesAllList = (value: unknown[], rhs: string) => {
  const values = rhs.split(',').map((v) => v.trim())

  return values.every((expected) =>
    value.some((item) => {
      if (typeof item === 'string') return item.toLowerCase() === expected.toLowerCase()
      if (typeof item === 'number') return item === Number(expected)
      if (typeof item === 'boolean') return item === (expected.toLowerCase() === 'true')
      return false
    }),
  )
}

const evaluateOperator = (op: Operator, value: unknown, rhs: string) => {
  if (Array.isArray(value)) {
    if (op === 'in') return value.some((item) => matchesInList(item, rhs))
    if (op === 'nin') return value.every((item) => matchesNinList(item, rhs))
    if (op === 'all') return matchesAllList(value, rhs)
  }

  return operatorFns[op]?.(value, rhs) ?? false
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
        return rhs !== undefined && evaluateOperator(op, v, rhs)
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
