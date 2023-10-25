import Ajv from 'ajv'

const validate = (body: unknown, schema: unknown) => {
  const ajv = new Ajv()

  // TODO Compile separately, just once at the start of the app
  const validate = ajv.compile(schema)

  return validate(body)
}

export default validate
