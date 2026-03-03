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

/**
 * Helper to define the If-Match header parameter for conditional write requests
 */
const getIfMatchParameter = (): ParameterObject => ({
  name: 'If-Match',
  in: 'header',
  required: true,
  schema: {
    type: 'string',
  },
  description:
    'The entity tag (ETag) of the resource. Required when ETags are enabled; the update or delete is only applied if this matches the current version.',
})

/**
 * Query parameter for LHS bracket filtering on collection endpoints.
 * Field names are user-defined so we use a free-form deepObject schema.
 */
const filterQueryParameter: ParameterObject = {
  name: 'filter',
  in: 'query',
  required: false,
  style: 'deepObject',
  explode: true,
  schema: {
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  },
  description:
    'Filter results using LHS bracket syntax, e.g. `filter.name[eq]=Alice` or `filter.age[gt]=18`. ' +
    'Supported operators: `eq`, `neq`, `contains`, `startsWith`, `endsWith`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `exists`, `regex`. ' +
    'Omitting the operator defaults to `eq`. String matching is case-insensitive.',
}

const malformedFilterResponse = {
  '400': {
    description: 'The filter expression is malformed.',
    content: {
      'application/json': {
        schema: defaultErrorResponseBodySchema,
        examples: {
          MalformedFilter: {
            value: {
              message: 'Malformed filter expression',
            },
          },
        },
      },
    },
  },
}

const preconditionFailedResponse = {
  '412': {
    description: 'Precondition failed. The ETag does not match the current version of the resource.',
    content: {
      'application/json': {
        schema: defaultErrorResponseBodySchema,
        examples: {
          PreconditionFailed: {
            value: {
              message: 'Precondition failed',
            },
          },
        },
      },
    },
  },
}

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
  if (config.requestInterceptor) {
    apiDescription +=
      '\n\nA request interceptor is configured. Some operations may return different status codes or response bodies than documented here.'
  }
  if (config.responseBodyInterceptor) {
    apiDescription +=
      '\n\nA response body interceptor is configured. GET response bodies may differ from the schemas documented here.'
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

  if (config.webSocket) {
    builder.addTag({
      name: 'WebSocket',
      description: 'Real-time updates via WebSocket',
    })

    builder.addPath('/ws', {
      get: {
        summary: 'WebSocket connection',
        description:
          'Connect to the WebSocket server to receive real-time broadcast messages whenever a resource is created, updated, or deleted.\n\n' +
          'Use a WebSocket client and connect to `ws://<host>/ws` (or `wss://` for HTTPS hosts).\n\n' +
          'Each broadcast message is a JSON object with the following shape:\n\n' +
          '```json\n' +
          '{ "resource": "movies", "action": "CREATE", "data": { "id": "123", ... } }\n' +
          '```\n\n' +
          'Possible `action` values: `"CREATE"`, `"UPDATE"`, `"DELETE"`, `"DELETE_ALL"`. ' +
          'For `"DELETE_ALL"` the `data` property is omitted.',
        operationId: 'connectWebSocket',
        parameters: [
          {
            name: 'Connection',
            in: 'header',
            required: true,
            schema: { type: 'string', enum: ['Upgrade'] },
            description: 'Must be set to `Upgrade`.',
          },
          {
            name: 'Upgrade',
            in: 'header',
            required: true,
            schema: { type: 'string', enum: ['websocket'] },
            description: 'Must be set to `websocket`.',
          },
        ],
        responses: {
          '101': {
            description:
              'Switching protocols — WebSocket connection established. The server will now push broadcast messages for all resource changes.',
          },
        },
        tags: ['WebSocket'],
      },
    })
  }

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
        parameters: [...getPathParameters(config, resourceInfo), filterQueryParameter],
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
          ...malformedFilterResponse,
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
        description: `Create a new ${singularResourceLowerCase}.`,
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
          ? `Delete all ${pluralResourceLowerCase}.`
          : 'Deleting whole collections is disabled. Enable by setting `allowDeleteCollection` to `true`.',
        operationId: `deleteAll${pluralResourceUpperCase}`,
        parameters: [
          ...getPathParameters(config, resourceInfo),
          filterQueryParameter,
          ...(config.etagsEnabled && config.allowDeleteCollection ? [getIfMatchParameter()] : []),
        ],
        responses: config.allowDeleteCollection
          ? {
              '204': {
                description: `All ${pluralResourceLowerCase} were deleted.`,
              },
              ...malformedFilterResponse,
              ...(config.etagsEnabled ? preconditionFailedResponse : {}),
            }
          : {
              '405': {
                description: `Method not allowed`,
              },
              ...malformedFilterResponse,
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
        description: `Create a new ${singularResourceLowerCase}, specifying your own id.`,
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
        description: `Replace ${indefinite(singularResourceLowerCase)}.`,
        operationId: `replace${singularResourceUpperCase}`,
        parameters: [
          ...getPathParameters(config, resourceInfo, true),
          ...(config.etagsEnabled ? [getIfMatchParameter()] : []),
        ],
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
          ...(config.etagsEnabled ? preconditionFailedResponse : {}),
        },
        tags: [resourceInfo.tag.name],
      },
      patch: {
        summary: `Update ${indefinite(singularResourceLowerCase)}`,
        description: `Update ${indefinite(singularResourceLowerCase)}.`,
        operationId: `update${singularResourceUpperCase}`,
        parameters: [
          ...getPathParameters(config, resourceInfo, true),
          ...(config.etagsEnabled ? [getIfMatchParameter()] : []),
        ],
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
          ...(config.etagsEnabled ? preconditionFailedResponse : {}),
        },
        tags: [resourceInfo.tag.name],
      },
      delete: {
        summary: `Delete ${indefinite(singularResourceLowerCase)}`,
        description: `Delete ${indefinite(singularResourceLowerCase)}.`,
        operationId: `delete${singularResourceUpperCase}`,
        parameters: [
          ...getPathParameters(config, resourceInfo, true),
          ...(config.etagsEnabled ? [getIfMatchParameter()] : []),
        ],
        responses: {
          '204': {
            description: `The ${singularResourceLowerCase} was deleted.`,
          },
          ...(config.etagsEnabled ? preconditionFailedResponse : {}),
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
