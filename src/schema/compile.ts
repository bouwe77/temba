import Ajv, { AnySchema } from 'ajv'
import { CompiledSchemas, ConfiguredSchemas } from './types'

export const compileSchemas = (configuredSchemas: ConfiguredSchemas | null) => {
  // Turn the configured schemas into compiled schemas
  const compiledSchemas: CompiledSchemas = {
    post: {},
    put: {},
    patch: {},
  }

  if (!configuredSchemas) return compiledSchemas

  // Use a single Ajv instance in the whole app
  const ajv = new Ajv()

  Object.keys(configuredSchemas).forEach((resource) => {
    if (configuredSchemas[resource]?.post) {
      compiledSchemas.post[resource] = ajv.compile(configuredSchemas[resource]?.post as AnySchema)
    }

    if (configuredSchemas[resource]?.put) {
      compiledSchemas.put[resource] = ajv.compile(configuredSchemas[resource]?.put as AnySchema)
    }

    if (configuredSchemas[resource]?.patch) {
      compiledSchemas.patch[resource] = ajv.compile(configuredSchemas[resource]?.patch as AnySchema)
    }
  })

  return compiledSchemas
}
