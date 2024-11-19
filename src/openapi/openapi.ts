import express from 'express'
import type { Config } from '../config'
import {
  OpenApiBuilder,
  type ParameterObject,
  type RequestBodyObject,
  type SchemaObject,
} from 'openapi3-ts/oas31'
import indefinite from 'indefinite'
import deepmerge from 'deepmerge'

const getRequestBodySchema = (schema: SchemaObject = { type: 'object' }) =>
  ({
    content: {
      'application/json': {
        schema,
      },
    },
  }) satisfies RequestBodyObject

const getResponseBodySchema = (requestSchema?: SchemaObject) => {
  const defaultSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  }

  if (!requestSchema) return defaultSchema

  return deepmerge(defaultSchema, requestSchema)
}

//TODO Kan ik garanderen dat een error altijd een message heeft? ---> In alle tests checken/toevoegen
const defaultErrorResponseBodySchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
}

const getPathParameters = (resourceInfo: ResourceInfo, id = false) => {
  const { resource, singularResourceLowerCase } = resourceInfo

  const resourceParameter = {
    name: 'resource',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
    },
    description: 'The name of the resource.',
  } satisfies ParameterObject

  const idParameter = {
    name: `${singularResourceLowerCase}Id`,
    in: 'path',
    required: true,
    schema: {
      type: 'string',
    },
    description: `The ID of the ${singularResourceLowerCase}.`,
  } satisfies ParameterObject

  let parameters: ParameterObject[] = []
  if (resource === anyResource) {
    parameters = [...parameters, resourceParameter]
  }

  if (id) {
    parameters = [...parameters, idParameter]
  }

  return parameters
}

type ResourceInfo = {
  resource: string
  pluralResourceLowerCase: string
  pluralResourceUpperCase: string
  singularResourceLowerCase: string
  singularResourceUpperCase: string
}

type OpenApiFormat = 'json' | 'yaml'

const anyResource = '{resource}'

export const createOpenApiRouter = (format: OpenApiFormat, config: Config) => {
  const openapiRouter = express.Router()

  openapiRouter.get('/', async (req, res) => {
    if (!config.openapi) {
      return res.status(404).json({ message: 'Not Found' })
    }

    const port = req.get('host')?.split(':')[1]
    const server = `${req.protocol}://${req.hostname}${port && !['80', '443'].includes(port) ? `:${port}` : ''}${config.apiPrefix ?? ''}`

    let resourceInfos = [
      {
        resource: anyResource,
        pluralResourceLowerCase: 'resources',
        pluralResourceUpperCase: 'Resources',
        singularResourceLowerCase: 'resource',
        singularResourceUpperCase: 'Resource',
      } satisfies ResourceInfo,
    ]

    if (config.resources.length > 0) {
      resourceInfos = config.resources.map((resource) => {
        if (typeof resource === 'string') {
          const pluralResourceLowerCase = resource.toLowerCase()
          const pluralResourceUpperCase =
            pluralResourceLowerCase.charAt(0).toUpperCase() + pluralResourceLowerCase.slice(1)
          let singularResourceLowerCase = pluralResourceLowerCase
          if (singularResourceLowerCase.endsWith('s')) {
            singularResourceLowerCase = singularResourceLowerCase.slice(0, -1)
          }
          const singularResourceUpperCase =
            singularResourceLowerCase.charAt(0).toUpperCase() + singularResourceLowerCase.slice(1)

          return {
            resource,
            pluralResourceLowerCase,
            pluralResourceUpperCase,
            singularResourceLowerCase,
            singularResourceUpperCase,
          } satisfies ResourceInfo
        } else {
          const pluralResourceLowerCase = resource.pluralName.toLowerCase()
          const pluralResourceUpperCase =
            pluralResourceLowerCase.charAt(0).toUpperCase() + pluralResourceLowerCase.slice(1)
          const singularResourceLowerCase = resource.singularName.toLowerCase()
          const singularResourceUpperCase =
            singularResourceLowerCase.charAt(0).toUpperCase() + singularResourceLowerCase.slice(1)
          return {
            resource: resource.resourcePath,
            pluralResourceLowerCase,
            pluralResourceUpperCase,
            singularResourceLowerCase,
            singularResourceUpperCase,
          } satisfies ResourceInfo
        }
      })
    }

    const spec = buildOpenApiSpec(server, resourceInfos)

    const builder = new OpenApiBuilder(
      typeof config.openapi === 'object' ? deepmerge(spec, config.openapi) : spec,
    )

    if (format === 'json') {
      return res.status(200).set('Content-Type', 'application/json').send(builder.getSpecAsJson())
    } else {
      return res.status(200).set('Content-Type', 'application/yaml').send(builder.getSpecAsYaml())
    }
  })

  const buildOpenApiSpec = (server: string, resourceInfos: ResourceInfo[]) => {
    let apiDescription =
      'This API has been generated using [Temba](https://github.com/bouwe77/temba).'
    if (!config.returnNullFields) {
      apiDescription += 'Any fields with `null` values are omitted in all API responses.'
    }

    const builder = OpenApiBuilder.create()
      .addOpenApiVersion('3.1.0')
      .addInfo({
        title: 'My API',
        version: '1.0',
        description: apiDescription,
      })
      .addLicense({
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      })
      // For convenience, we use a generic server URL, relative to where the docs are served from.
      .addServer({
        url: server,
      })

    resourceInfos.forEach((resourceInfo) => {
      const {
        resource,
        pluralResourceLowerCase,
        pluralResourceUpperCase,
        singularResourceLowerCase,
        singularResourceUpperCase,
      } = resourceInfo

      // GET on the root URL
      builder.addPath('/', {
        get: {
          summary: 'API root',
          operationId: 'getApiRoot',
          responses: {
            '200': {
              description: 'The API is working.',
              content: {
                'text/html': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      })

      const postRequestSchema = config.schemas?.[resource as keyof typeof config.schemas]
        ?.post as SchemaObject

      const responseSchema = getResponseBodySchema(postRequestSchema)

      console.log(responseSchema)

      // GET, HEAD, POST on a collection
      builder.addPath(`/${resource}`, {
        get: {
          summary: `List all ${pluralResourceLowerCase}.`,
          operationId: `getAll${pluralResourceUpperCase}`,
          parameters: getPathParameters(resourceInfo),
          responses: {
            '200': {
              description: `List of all ${pluralResourceLowerCase}.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: responseSchema,
                  },
                },
              },
            },
          },
        },
        head: {
          summary: `Returns HTTP headers for the list of ${pluralResourceLowerCase}.`,
          operationId: `getAll${pluralResourceUpperCase}Headers`,
          parameters: getPathParameters(resourceInfo),
          responses: {
            '200': {
              description: `HTTP headers for the list of all ${pluralResourceLowerCase}.`,
            },
          },
        },
        post: {
          summary: `Create a new ${singularResourceLowerCase}.`,
          operationId: `create${singularResourceUpperCase}`,
          parameters: getPathParameters(resourceInfo),
          requestBody: getRequestBodySchema(postRequestSchema),
          responses: {
            '201': {
              description: `The ${singularResourceLowerCase} was created. The created ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: responseSchema,
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                  examples: {
                    IdNotAllowedInUrl: {
                      value: {
                        message: 'An id is not allowed in the URL',
                      },
                    },
                    IdNotAllowedInRequestBody: {
                      value: {
                        message: 'An id is not allowed in the request body',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      // DELETE on a collection if configured
      if (config.allowDeleteCollection) {
        builder.addPath(`/${resource}`, {
          delete: {
            summary: `Delete all ${pluralResourceLowerCase}.`,
            operationId: `deleteAll${pluralResourceUpperCase}`,
            parameters: getPathParameters(resourceInfo),
            responses: {
              '204': {
                description: `All ${pluralResourceLowerCase} were deleted.`,
              },
            },
          },
        })
      } else {
        builder.addPath(`/${resource}`, {
          delete: {
            summary:
              'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
            operationId: `deleteAll${pluralResourceUpperCase}`,
            parameters: getPathParameters(resourceInfo),
            responses: {
              '405': {
                description: `Method not allowed`,
              },
            },
          },
        })
      }

      // GET, HEAD, PUT, PATCH, DELETE on an ID
      builder.addPath(`/${resource}/{${singularResourceLowerCase}Id}`, {
        get: {
          summary: `Find ${indefinite(singularResourceLowerCase)} by ID`,
          operationId: `get${singularResourceUpperCase}ById`,
          parameters: getPathParameters(resourceInfo, true),
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} with the ${singularResourceLowerCase}Id.`,
              content: {
                'application/json': {
                  schema: responseSchema,
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                },
              },
            },
          },
        },
        head: {
          summary: `Returns HTTP headers for the ${singularResourceLowerCase} by ID.`,
          operationId: `get${singularResourceUpperCase}ByIdHeaders`,
          parameters: getPathParameters(resourceInfo, true),
          responses: {
            '200': {
              description: `HTTP headers for the ${singularResourceLowerCase} with the ${singularResourceLowerCase}Id.`,
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
            },
          },
        },
        put: {
          summary: `Replace ${indefinite(singularResourceLowerCase)}.`,
          operationId: `replace${singularResourceUpperCase}`,
          parameters: getPathParameters(resourceInfo, true),
          requestBody: getRequestBodySchema(
            config.schemas?.[resource as keyof typeof config.schemas]?.put as SchemaObject,
          ),
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} was replaced. The replaced ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: responseSchema,
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                  examples: {
                    MissingIdInUrl: {
                      value: {
                        message: 'An id is required in the URL',
                      },
                    },
                    IdNotAllowedInRequestBody: {
                      value: {
                        message: 'An id is not allowed in the request body',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          summary: `Update ${indefinite(singularResourceLowerCase)}.`,
          operationId: `update${singularResourceUpperCase}`,
          parameters: getPathParameters(resourceInfo, true),
          requestBody: getRequestBodySchema(
            config.schemas?.[resource as keyof typeof config.schemas]?.patch as SchemaObject,
          ),
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} was updated. The updated ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: responseSchema,
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: defaultErrorResponseBodySchema,
                  examples: {
                    MissingIdInUrl: {
                      value: {
                        message: 'An id is required in the URL',
                      },
                    },
                    IdNotAllowedInRequestBody: {
                      value: {
                        message: 'An id is not allowed in the request body',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: `Delete ${indefinite(singularResourceLowerCase)}.`,
          operationId: `delete${singularResourceUpperCase}`,
          parameters: getPathParameters(resourceInfo, true),
          responses: {
            '204': {
              description: `The ${singularResourceLowerCase} was deleted.`,
            },
          },
        },
      })
    })

    return builder.getSpec()
  }
  return openapiRouter
}
