// @custom-server
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { createServer } from './createServer'

const getStaticFileFromDisk = async (
  filename: string,
): Promise<{ content: Buffer; mimeType: string }> => {
  if (filename === 'index.html')
    return Promise.resolve({
      content: Buffer.from(`
<!DOCTYPE html>
<html>
  <head>
    <title>Temba</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>`),
      mimeType: 'text/html',
    })
  else throw { code: 'ENOENT' }
}

test('Returns static content and API routes have an "api" apiPrefix', async () => {
  const tembaServer = await createServer(
    {
      staticFolder: 'dist',
    },
    {
      getStaticFileFromDisk,
    },
  )

  const staticFolderResponse = await request(tembaServer).get('')
  expect(staticFolderResponse.status).toBe(200)
  expect(staticFolderResponse.text).toContain('<!DOCTYPE html>')
  expect(staticFolderResponse.text).toContain('Hello, World!')

  const apiResponse = await request(tembaServer).get('/api')
  expect(apiResponse.status).toBe(200)
  expect(apiResponse.text).toContain('My API')

  const wrongResourceResponse = await request(tembaServer).get('/articles')
  expect(wrongResourceResponse.status).toBe(404)

  const resourceResponse = await request(tembaServer).get('/api/articles')
  expect(resourceResponse.status).toBe(200)
  expect(resourceResponse.body).toEqual([])
})

test('Returns static index content when root URL has query string parameters', async () => {
  const requestedFilenames: string[] = []
  const tembaServer = await createServer(
    {
      staticFolder: 'dist',
    },
    {
      getStaticFileFromDisk: async (filename) => {
        requestedFilenames.push(filename)
        return getStaticFileFromDisk(filename)
      },
    },
  )

  const staticFolderResponse = await request(tembaServer).get('/?foo=bar')
  expect(staticFolderResponse.status).toBe(200)
  expect(staticFolderResponse.text).toContain('<!DOCTYPE html>')
  expect(staticFolderResponse.text).toContain('Hello, World!')
  expect(requestedFilenames).toEqual(['index.html'])
})

describe('static asset routing', () => {
  test('serves an existing physical file before considering SPA fallback', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
        resources: ['articles'],
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)

          if (filename === '/css/style.css')
            return { content: Buffer.from('body { color: red; }'), mimeType: 'text/css' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/css/style.css')

    expect(response.status).toBe(200)
    expect(response.text).toBe('body { color: red; }')
    expect(response.headers['content-type']).toContain('text/css')
    expect(requestedFilenames).toEqual(['/css/style.css'])
  })

  test('tries the physical route path before falling back to index.html in SPA mode', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/dashboard').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Hello, World!')
    expect(requestedFilenames).toEqual(['/dashboard', '/dashboard/index.html', 'index.html'])
  })

  test('does not serve static assets for API-prefixed requests', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const resourceResponse = await request(tembaServer).get('/api/articles')
    expect(resourceResponse.status).toBe(200)
    expect(resourceResponse.body).toEqual([])

    const missingResourceResponse = await request(tembaServer).get(
      '/api/articles/id_does_not_exist',
    )
    expect(missingResourceResponse.status).toBe(404)
    expect(requestedFilenames).toEqual([])
  })
})

describe('SPA static asset fallback', () => {
  test('serves index.html for an HTML route when the physical file does not exist', async () => {
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk,
      },
    )

    const response = await request(tembaServer).get('/dashboard').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Hello, World!')
  })

  test('serves index.html for a dotted route when the request accepts HTML', async () => {
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk,
      },
    )

    const response = await request(tembaServer)
      .get('/user/john.doe')
      .set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Hello, World!')
  })

  test('returns 404 for a missing dotted asset and does not serve index.html', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/missing-style.css')

    expect(response.status).toBe(404)
    expect(response.text).not.toContain('Hello, World!')
    expect(requestedFilenames).toEqual(['/missing-style.css'])
  })

  test('returns 404 for a route request that does not accept HTML', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer)
      .get('/dashboard')
      .set('Accept', 'application/json')

    expect(response.status).toBe(404)
    expect(requestedFilenames).toEqual(['/dashboard'])
  })
})

describe('nearest static index fallback', () => {
  test('redirects a directory request without a trailing slash to the directory URL', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)

          if (filename === '/todo') {
            const error = new Error('Is a directory') as NodeJS.ErrnoException
            error.code = 'EISDIR'
            throw error
          }

          if (filename === '/todo/index.html')
            return { content: Buffer.from('<h1>Todo</h1>'), mimeType: 'text/html' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/todo').set('Accept', 'text/html')

    expect(response.status).toBe(301)
    expect(response.headers.location).toBe('/todo/')
    expect(response.text).not.toContain('<h1>Todo</h1>')
    expect(requestedFilenames).toEqual(['/todo', '/todo/index.html'])
  })

  test('preserves query string parameters when redirecting to a directory URL', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)

          if (filename === '/todo') {
            const error = new Error('Is a directory') as NodeJS.ErrnoException
            error.code = 'EISDIR'
            throw error
          }

          if (filename === '/todo/index.html')
            return { content: Buffer.from('<h1>Todo</h1>'), mimeType: 'text/html' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer)
      .get('/todo?filter=open')
      .set('Accept', 'text/html')

    expect(response.status).toBe(301)
    expect(response.headers.location).toBe('/todo/?filter=open')
    expect(response.text).not.toContain('<h1>Todo</h1>')
    expect(requestedFilenames).toEqual(['/todo', '/todo/index.html'])
  })

  test('redirects a nested directory request without a trailing slash to the directory URL', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)

          if (filename === '/a/b') {
            const error = new Error('Is a directory') as NodeJS.ErrnoException
            error.code = 'EISDIR'
            throw error
          }

          if (filename === '/a/b/index.html')
            return { content: Buffer.from('<h1>Nested</h1>'), mimeType: 'text/html' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/a/b').set('Accept', 'text/html')

    expect(response.status).toBe(301)
    expect(response.headers.location).toBe('/a/b/')
    expect(response.text).not.toContain('<h1>Nested</h1>')
    expect(requestedFilenames).toEqual(['/a/b', '/a/b/index.html'])
  })

  test('serves the nearest index.html when a nested SPA route is requested', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)

          if (filename === '/admin/index.html')
            return { content: Buffer.from('<h1>Admin</h1>'), mimeType: 'text/html' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer)
      .get('/admin/users/42')
      .set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.text).toContain('<h1>Admin</h1>')
    expect(requestedFilenames).toEqual([
      '/admin/users/42',
      '/admin/users/42/index.html',
      '/admin/users/index.html',
      '/admin/index.html',
    ])
  })

  test('falls back to root index.html when no nested index.html exists', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: 'dist',
      },
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer)
      .get('/admin/users/42')
      .set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Hello, World!')
    expect(requestedFilenames).toEqual([
      '/admin/users/42',
      '/admin/users/42/index.html',
      '/admin/users/index.html',
      '/admin/index.html',
      'index.html',
    ])
  })
})

describe('filesystem static asset mode', () => {
  test('serves an existing physical file', async () => {
    const tembaServer = await createServer(
      {
        staticFolder: { path: 'dist', mode: 'filesystem' },
      } as never,
      {
        getStaticFileFromDisk: async (filename) => {
          if (filename === '/css/style.css')
            return { content: Buffer.from('body { color: red; }'), mimeType: 'text/css' }

          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/css/style.css')

    expect(response.status).toBe(200)
    expect(response.text).toBe('body { color: red; }')
    expect(response.headers['content-type']).toContain('text/css')
  })

  test('returns 404 for a route when no physical file exists', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: { path: 'dist', mode: 'filesystem' },
      } as never,
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer).get('/dashboard').set('Accept', 'text/html')

    expect(response.status).toBe(404)
    expect(requestedFilenames).toEqual(['/dashboard'])
  })

  test('returns 404 for a dotted HTML route when no physical file exists', async () => {
    const requestedFilenames: string[] = []
    const tembaServer = await createServer(
      {
        staticFolder: { path: 'dist', mode: 'filesystem' },
      } as never,
      {
        getStaticFileFromDisk: async (filename) => {
          requestedFilenames.push(filename)
          return getStaticFileFromDisk(filename)
        },
      },
    )

    const response = await request(tembaServer)
      .get('/user/john.doe')
      .set('Accept', 'text/html')

    expect(response.status).toBe(404)
    expect(requestedFilenames).toEqual(['/user/john.doe'])
  })
})

test('When root index.html cannot be read, SPA route requests return a 404', async () => {
  const tembaServer = await createServer(
    {
      staticFolder: 'dist',
    },
    {
      getStaticFileFromDisk: () => {
        throw { code: 'ENOENT' }
      },
    },
  )

  const response = await request(tembaServer).get('/dashboard').set('Accept', 'text/html')

  expect(response.status).toBe(404)
})

test('When static file not found, it returns a 404', async () => {
  const tembaServer = await createServer(
    {
      staticFolder: 'dist',
    },
    {
      getStaticFileFromDisk: () => {
        throw { code: 'ENOENT' }
      },
    },
  )

  const staticFolderResponse = await request(tembaServer).get('')
  expect(staticFolderResponse.status).toBe(404)
})

test('When reading static file errors, it returns a 500', async () => {
  const tembaServer = await createServer(
    {
      staticFolder: 'dist',
    },
    {
      getStaticFileFromDisk: () => {
        throw new Error('Failed to get static folder content')
      },
    },
  )

  const staticFolderResponse = await request(tembaServer).get('')
  expect(staticFolderResponse.status).toBe(500)
})

describe('Path traversal prevention', () => {
  // The path traversal check in createGetStaticFileFromDisk throws an error
  // with code 'ENOENT' when a traversal is detected. This ensures that
  // the HTTP layer translates that into a 404 (not a 500 or any other status),
  // so traversal attempts are indistinguishable from ordinary missing files.
  const throwTraversalError = () => {
    const error = new Error('Forbidden') as NodeJS.ErrnoException
    error.code = 'ENOENT'
    throw error
  }

  test('a path traversal attempt returns 404, not 500', async () => {
    const tembaServer = await createServer(
      { staticFolder: 'dist' },
      { getStaticFileFromDisk: throwTraversalError },
    )
    const response = await request(tembaServer).get('/../../../etc/passwd')
    expect(response.status).toBe(404)
  })

  test('a traversal via subdirectory hops returns 404, not 500', async () => {
    const tembaServer = await createServer(
      { staticFolder: 'dist' },
      { getStaticFileFromDisk: throwTraversalError },
    )
    const response = await request(tembaServer).get('/subdir/../../etc/passwd')
    expect(response.status).toBe(404)
  })
})

test('Only GET method is allowed for static folder', async () => {
  const tembaServer = await createServer({
    staticFolder: 'dist',
  })

  const postResponse = await request(tembaServer).post('')
  expect(postResponse.status).toBe(405)

  const putResponse = await request(tembaServer).put('')
  expect(putResponse.status).toBe(405)

  const patchResponse = await request(tembaServer).patch('')
  expect(patchResponse.status).toBe(405)

  const deleteResponse = await request(tembaServer).delete('')
  expect(deleteResponse.status).toBe(405)
})
