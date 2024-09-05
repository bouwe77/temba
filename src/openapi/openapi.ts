import express from 'express'
import type { Config } from '../config'
import { OpenApiBuilder, type ParameterObject } from 'openapi3-ts/oas31'

type ResourceInfo = {
  resource: string
  pluralResourceLowerCase: string
  pluralResourceUpperCase: string
  singularResourceLowerCase: string
  singularResourceUpperCase: string
}

type OpenApiFormat = 'json' | 'yaml'

export const createOpenApiRouter = (format: OpenApiFormat, config: Config) => {
  const openapiRouter = express.Router()

  openapiRouter.get('/', async (_, res) => {
    if (!config.openapi || config.resources.length === 0) {
      return res.status(404).json({ message: 'Not Found' })
    }

    const resourceInfos = config.resources.map((resource) => {
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
    })

    const spec = buildOpenApiSpec(format, resourceInfos)

    // console.log(JSON.stringify(builder.getSpec().paths, null, 2))

    if (format === 'json') {
      return res.status(200).set('Content-Type', 'application/json').json(spec)
    } else {
      return res.status(200).set('Content-Type', 'application/yaml').send(spec)
    }
  })

  const buildOpenApiSpec = (format: OpenApiFormat, resourceInfos: ResourceInfo[]) => {
    const builder = OpenApiBuilder.create()
      .addOpenApiVersion('3.1.0')
      .addInfo({
        title: 'My API',
        version: '1.0',
        description: 'This API has been generated using [Temba](https://github.com/bouwe77/temba).',
      })
      .addLicense({
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      })
      // For convenience, we use a generic server URL, relative to where the docs are served from.
      .addServer({
        url: config.apiPrefix || '/',
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

      // GET, HEAD, POST on a collection
      builder.addPath(`/${resource}`, {
        get: {
          summary: `List all ${pluralResourceLowerCase}.`,
          operationId: `getAll${pluralResourceUpperCase}`,
          responses: {
            '200': {
              description: `List of all ${pluralResourceLowerCase}.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        head: {
          summary: `Returns HTTP headers for the list of ${pluralResourceLowerCase}.`,
          operationId: `getAll${pluralResourceUpperCase}Headers`,
          responses: {
            '200': {
              description: `HTTP headers for the list of all ${pluralResourceLowerCase}.`,
            },
          },
        },
        post: {
          summary: `Create a new ${singularResourceLowerCase}.`,
          operationId: `create${singularResourceUpperCase}`,
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
          responses: {
            '201': {
              description: `The ${singularResourceLowerCase} was created. The created ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
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
            responses: {
              '405': {
                description: `Method not allowed`,
              },
            },
          },
        })
      }

      const idPathParameter = {
        name: `${singularResourceLowerCase}Id`,
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
        description: `The ID of the ${singularResourceLowerCase}.`,
      } satisfies ParameterObject

      // GET, HEAD, PUT, PATCH, DELETE on an ID
      builder.addPath(`/${resource}/{${singularResourceLowerCase}Id}`, {
        get: {
          summary: `Find a ${singularResourceLowerCase} by ID`,
          operationId: `get${singularResourceUpperCase}ById`,
          parameters: [idPathParameter],
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} with the ${singularResourceLowerCase}Id.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        head: {
          summary: `Returns HTTP headers for the ${singularResourceLowerCase} by ID.`,
          operationId: `get${singularResourceUpperCase}ByIdHeaders`,
          parameters: [idPathParameter],
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
          summary: `Replace a ${singularResourceLowerCase}.`,
          operationId: `replace${singularResourceUpperCase}`,
          parameters: [idPathParameter],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} was replaced. The replaced ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
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
          summary: `Update a ${singularResourceLowerCase}.`,
          operationId: `update${singularResourceUpperCase}`,
          parameters: [idPathParameter],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
          responses: {
            '200': {
              description: `The ${singularResourceLowerCase} was updated. The updated ${singularResourceLowerCase} is returned in the response.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '404': {
              description: `The ${singularResourceLowerCase}Id was not found.`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'The request was invalid.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
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
          summary: `Delete a ${singularResourceLowerCase}.`,
          operationId: `delete${singularResourceUpperCase}`,
          parameters: [idPathParameter],
          responses: {
            '204': {
              description: `The ${singularResourceLowerCase} was deleted.`,
            },
          },
        },
      })
    })

    if (format === 'json') {
      return builder.getSpec()
    } else {
      return builder.getSpecAsYaml()
    }
  }
  return openapiRouter
}
