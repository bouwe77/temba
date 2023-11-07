import Ajv from 'ajv'
import { ConfiguredSchemas, CompiledSchemas } from './types'
import { transformSchemas } from './transformConfig'

const compileSchemas = (schemas: ConfiguredSchemas) => {
  // Use a single Ajv instance in the whole app
  const ajv = new Ajv()

  // Turn the configured schemas into compiled schemas
  const compiledSchemas: CompiledSchemas = { ...schemas }
  Object.keys(schemas).forEach((resource) => {
    Object.keys(schemas[resource]).forEach((method) => {
      compiledSchemas[resource][method] = ajv.compile(schemas[resource][method])
    })
  })

  return compiledSchemas
}

export const compileAndTransformSchemas = (schemas: ConfiguredSchemas): CompiledSchemas => {
  let transformedSchemas = {}
  if (schemas) {
    const compiledSchemas = compileSchemas(schemas)
    transformedSchemas = transformSchemas(compiledSchemas)
  }

  return transformedSchemas
}
