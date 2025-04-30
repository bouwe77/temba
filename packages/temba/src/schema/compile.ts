import Ajv from 'ajv'
import type { CompiledSchemas, ConfiguredSchemas } from './types'

export const compileSchemas = (configuredSchemas: ConfiguredSchemas | null) => {
  const compiledSchemas: CompiledSchemas = {
    post: {},
    put: {},
    patch: {},
  }

  if (!configuredSchemas) return compiledSchemas

  const ajv = new Ajv()

  for (const resource of Object.keys(configuredSchemas)) {
    const schemaSet = configuredSchemas[resource]

    if (schemaSet?.post) {
      compiledSchemas.post[resource] = ajv.compile(schemaSet.post)
    }

    if (schemaSet?.put) {
      compiledSchemas.put[resource] = ajv.compile(schemaSet.put)
    }

    if (schemaSet?.patch) {
      compiledSchemas.patch[resource] = ajv.compile(schemaSet.patch)
    }
  }

  return compiledSchemas
}
