import { ConfiguredSchemas, TransformedSchemas } from './types'

export const transformSchemas = (schemas: ConfiguredSchemas): TransformedSchemas => {
  const transformedObject = {}

  for (const resource in schemas) {
    for (const key in schemas[resource]) {
      if (!transformedObject[key]) {
        transformedObject[key] = {}
      }
      transformedObject[key][resource] = schemas[resource][key]
    }
  }

  return transformedObject
}
