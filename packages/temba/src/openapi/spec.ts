// Creates the OpenAPI spec in JSON or YAML format

import deepmerge from 'deepmerge'
import indefinite from 'indefinite'
import {
  OpenApiBuilder,
  type ParameterObject,
  type RequestBodyObject,
  type SchemaObject,
} from 'openapi3-ts/oas31'
import type { Config } from '../config'

type OpenApiFormat = 'json' | 'yaml'

const anyResource = '{resource}'

type ResourceInfo = {
  resource: string
  pluralResourceLowerCase: string
  pluralResourceUpperCase: string
  singularResourceLowerCase: string
  singularResourceUpperCase: string
  tag: {
    name: string
    description: string
  }
}

const defaultResourceInfos = [
  {
    resource: anyResource,
    pluralResourceLowerCase: 'resources',
    pluralResourceUpperCase: 'Resources',
    singularResourceLowerCase: 'resource',
    singularResourceUpperCase: 'Resource',
    tag: {
      name: 'Resources',
      description: 'All resources',
    },
  } satisfies ResourceInfo,
]

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

const defaultErrorResponseBodySchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
}

/**
 * Helper to define the ETag header for responses
 */
const getEtagHeader = () => ({
  ETag: {
    description: 'The entity tag for the resource.',
    schema: {
      type: 'string',
    },
  },
})

const getPathParameters = (config: Config, resourceInfo: ResourceInfo, id = false) => {
  const { resource, singularResourceLowerCase } = resourceInfo

  let parameters: ParameterObject[] = []

  // If ETags are enabled, add If-None-Match as an optional header parameter
  if (config.etagsEnabled) {
    parameters = [
      ...parameters,
      {
        name: 'If-None-Match',
        in: 'header',
        required: false,
        schema: {
          type: 'string',
        },
        description: 'The entity tag (ETag) previously returned. Used for conditional requests.',
      },
    ]
  }

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

  if (resource === anyResource) {
    parameters = [...parameters, resourceParameter]
  }

  if (id) {
    parameters = [...parameters, idParameter]
  }

  return parameters
}

const getServerUrl = (requestHost: string) => {
  const hostname = requestHost.split(':')[0] || ''
  const port = requestHost.split(':')[1] || ''
  const protocol = ['localhost', '127.0.0.1'].includes(hostname) ? 'http' : 'https'

  let server = `${protocol}://${hostname}`
  server += !['80', '443'].includes(port) ? `:${port}` : ''

  return server
}

const buildOpenApiSpec = (config: Config, server: string, resourceInfos: ResourceInfo[]) => {
  let apiDescription =
    'This API has been generated using [Temba](https://github.com/bouwe77/temba).'
  if (!config.returnNullFields) {
    apiDescription += '\n\nAny fields with `null` values are omitted in all API responses.'
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
    .addServer({
      url: server,
    })

  builder.addTag({
    name: 'API',
    description: 'Shows information about the API',
  })

  // Add WebSocket schema and path when WebSocket is enabled
  if (config.webSocket) {
    const webSocketMessageSchema: SchemaObject = {
      type: 'object',
      required: ['resource', 'action'],
      properties: {
        resource: { type: 'string' },
        action: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'DELETE_ALL'] },
      },
      oneOf: [
        {
          description: 'Standard mutation events',
          required: ['data'],
          properties: {
            action: { enum: ['CREATE', 'UPDATE', 'DELETE'] },
            data: { type: 'object' },
          },
        },
        {
          description: 'Collection clear events',
          properties: {
            action: { const: 'DELETE_ALL' },
          },
          not: { required: ['data'] },
        },
      ],
    }

    builder.addSchema('WebSocketMessage', webSocketMessageSchema)

    builder.addPath('/ws', {
      get: {
        summary: 'WebSocket Real-time Feed',
        description:
          'Establish a WebSocket connection to receive real-time updates. Handshake requires an HTTP GET with an Upgrade header.',
        operationId: 'connectWebSocket',
        responses: {
          '101': {
            description: 'Switching Protocols',
          },
        },
        tags: ['API'],
      },
    })
  }

  // GET on the root URL
  builder.addPath('/', {
    get: {
      summary: 'API root',
      description: 'Shows information about the API.',
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
      tags: ['API'],
    },
  })

  resourceInfos.forEach((resourceInfo) => {
    const {
      resource,
      pluralResourceLowerCase,
      pluralResourceUpperCase,
      singularResourceLowerCase,
      singularResourceUpperCase,
    } = resourceInfo

    builder.addTag(resourceInfo.tag)

    const nullFieldsRemark = () =>
      config.returnNullFields
        ? ''
        : '\n\nAny fields with `null` values are omitted in all API responses.'

    const postRequestSchema = config.schemas?.[resource as keyof typeof config.schemas]
      ?.post as SchemaObject

    const responseSchema = getResponseBodySchema(postRequestSchema)

    // Conditional headers based on config
    const responseHeaders = config.etagsEnabled ? getEtagHeader() : undefined

    // GET, HEAD, POST on a collection
    builder.addPath(`/${resource}`, {
      get: {
        description: `List all ${pluralResourceLowerCase}.`,
        summary: `List all ${pluralResourceLowerCase}`,
        operationId: `getAll${pluralResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo),
        responses: {
          '200': {
            description: `List of all ${pluralResourceLowerCase}.${nullFieldsRemark()}`,
            headers: responseHeaders,
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
        tags: [resourceInfo.tag.name],
      },
      head: {
        summary: `HTTP headers for all ${pluralResourceLowerCase}`,
        description: `Returns HTTP headers for all ${pluralResourceLowerCase}.`,
        operationId: `getAll${pluralResourceUpperCase}Headers`,
        parameters: getPathParameters(config, resourceInfo),
        responses: {
          '200': {
            description: `HTTP headers for all ${pluralResourceLowerCase}.`,
            headers: responseHeaders,
          },
        },
        tags: [resourceInfo.tag.name],
      },
      post: {
        summary: `Create a new ${singularResourceLowerCase}`,
        description: `Create a new ${singularResourceLowerCase}.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`,
        operationId: `create${singularResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo),
        requestBody: getRequestBodySchema(postRequestSchema),
        responses: {
          '201': {
            description: `The ${singularResourceLowerCase} was created. The created ${singularResourceLowerCase} is returned in the response.${nullFieldsRemark()}`,
            headers: responseHeaders,
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
        tags: [resourceInfo.tag.name],
      },
    })

    // DELETE on a collection
    builder.addPath(`/${resource}`, {
      delete: {
        summary: `Delete all ${pluralResourceLowerCase}`,
        description: config.allowDeleteCollection
          ? `Delete all ${pluralResourceLowerCase}.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`
          : 'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
        operationId: `deleteAll${pluralResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo),
        responses: config.allowDeleteCollection
          ? {
              '204': {
                description: `All ${pluralResourceLowerCase} were deleted.`,
              },
            }
          : {
              '405': {
                description: `Method not allowed`,
              },
            },
        tags: [resourceInfo.tag.name],
      },
    })

    // GET, HEAD, POST, PUT, PATCH, DELETE on an ID
    builder.addPath(`/${resource}/{${singularResourceLowerCase}Id}`, {
      get: {
        summary: `Find ${indefinite(singularResourceLowerCase)} by ID`,
        description: `Find ${indefinite(singularResourceLowerCase)} by ID.`,
        operationId: `get${singularResourceUpperCase}ById`,
        parameters: getPathParameters(config, resourceInfo, true),
        responses: {
          '200': {
            description: `The ${singularResourceLowerCase} with the ${singularResourceLowerCase}Id.${nullFieldsRemark()}`,
            headers: responseHeaders,
            content: {
              'application/json': {
                schema: responseSchema,
              },
            },
          },
          ...(config.etagsEnabled
            ? {
                '304': {
                  description: 'The resource has not been modified.',
                  headers: responseHeaders,
                },
              }
            : {}),
          '404': {
            description: `The ${singularResourceLowerCase}Id was not found.`,
            content: {
              'application/json': {
                schema: defaultErrorResponseBodySchema,
              },
            },
          },
        },
        tags: [resourceInfo.tag.name],
      },
      head: {
        summary: `HTTP headers for the ${singularResourceLowerCase} by ID`,
        description: `Returns HTTP headers for the ${singularResourceLowerCase} by ID.`,
        operationId: `get${singularResourceUpperCase}ByIdHeaders`,
        parameters: getPathParameters(config, resourceInfo, true),
        responses: {
          '200': {
            description: `HTTP headers for the ${singularResourceLowerCase} with the ${singularResourceLowerCase}Id.`,
            headers: responseHeaders,
          },
          '404': {
            description: `The ${singularResourceLowerCase}Id was not found.`,
          },
        },
        tags: [resourceInfo.tag.name],
      },
      post: {
        summary: `Create a new ${singularResourceLowerCase} with id`,
        description: `Create a new ${singularResourceLowerCase}, specifying your own id.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`,
        operationId: `create${singularResourceUpperCase}WithId`,
        parameters: getPathParameters(config, resourceInfo, true),
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
            description: `The ${singularResourceLowerCase} was created. The created ${singularResourceLowerCase} is returned in the response.${nullFieldsRemark()}`,
            headers: responseHeaders,
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
                  IdNotAllowedInRequestBody: {
                    value: {
                      message: 'An id is not allowed in the request body',
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'The id already exists.',
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
                  IdAlreadyExists: {
                    value: {
                      message: "ID '{resourceId}' already exists",
                    },
                  },
                },
              },
            },
          },
        },
        tags: [resourceInfo.tag.name],
      },
      put: {
        summary: `Replace ${indefinite(singularResourceLowerCase)}`,
        description: `Replace ${indefinite(singularResourceLowerCase)}.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`,
        operationId: `replace${singularResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo, true),
        requestBody: getRequestBodySchema(
          config.schemas?.[resource as keyof typeof config.schemas]?.put as SchemaObject,
        ),
        responses: {
          '200': {
            description: `The ${singularResourceLowerCase} was replaced. The replaced ${singularResourceLowerCase} is returned in the response.${nullFieldsRemark()}`,
            headers: responseHeaders,
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
        tags: [resourceInfo.tag.name],
      },
      patch: {
        summary: `Update ${indefinite(singularResourceLowerCase)}`,
        description: `Update ${indefinite(singularResourceLowerCase)}.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`,
        operationId: `update${singularResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo, true),
        requestBody: getRequestBodySchema(
          config.schemas?.[resource as keyof typeof config.schemas]?.patch as SchemaObject,
        ),
        responses: {
          '200': {
            description: `The ${singularResourceLowerCase} was updated. The updated ${singularResourceLowerCase} is returned in the response.${nullFieldsRemark()}`,
            headers: responseHeaders,
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
        tags: [resourceInfo.tag.name],
      },
      delete: {
        summary: `Delete ${indefinite(singularResourceLowerCase)}`,
        description: `Delete ${indefinite(singularResourceLowerCase)}.${config.webSocket ? '\n\nSuccessful requests broadcast a message to the /ws WebSocket feed.' : ''}`,
        operationId: `delete${singularResourceUpperCase}`,
        parameters: getPathParameters(config, resourceInfo, true),
        responses: {
          '204': {
            description: `The ${singularResourceLowerCase} was deleted.`,
          },
        },
        tags: [resourceInfo.tag.name],
      },
    })
  })

  return builder.getSpec()
}

export const getSpec = (
  config: Config,
  request: {
    host: string
    format: OpenApiFormat
  },
) => {
  let resourceInfos = defaultResourceInfos

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
        const tag = {
          name: pluralResourceUpperCase,
          description: `All ${pluralResourceLowerCase}`,
        }

        return {
          resource,
          pluralResourceLowerCase,
          pluralResourceUpperCase,
          singularResourceLowerCase,
          singularResourceUpperCase,
          tag,
        } satisfies ResourceInfo
      } else {
        const pluralResourceLowerCase = resource.pluralName.toLowerCase()
        const pluralResourceUpperCase =
          pluralResourceLowerCase.charAt(0).toUpperCase() + pluralResourceLowerCase.slice(1)
        const singularResourceLowerCase = resource.singularName.toLowerCase()
        const singularResourceUpperCase =
          singularResourceLowerCase.charAt(0).toUpperCase() + singularResourceLowerCase.slice(1)
        const tag = {
          name: pluralResourceUpperCase,
          description: `All ${pluralResourceLowerCase}`,
        }

        return {
          resource: resource.resourcePath,
          pluralResourceLowerCase,
          pluralResourceUpperCase,
          singularResourceLowerCase,
          singularResourceUpperCase,
          tag,
        } satisfies ResourceInfo
      }
    })
  }

  let server = getServerUrl(request.host)
  if (config.apiPrefix) server += `/${config.apiPrefix}/`

  const spec = buildOpenApiSpec(config, server, resourceInfos)

  const builder = new OpenApiBuilder(
    typeof config.openapi === 'object' ? deepmerge(spec, config.openapi) : spec,
  )

  return request.format === 'json' ? builder.getSpecAsJson() : builder.getSpecAsYaml()
}
