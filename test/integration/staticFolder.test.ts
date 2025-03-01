import { test, expect } from 'vitest'
import request from 'supertest'
import { createServer } from './createServer'

const getStaticFileFromDisk = (filename: string) => {
  if (filename === 'index.html')
    return {
      content: `
<!DOCTYPE html>
<html>
  <head>
    <title>Temba</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>`,
      mimeType: 'text/html',
    }
  else throw { code: 'ENOENT' }
}

test('Returns static content and API routes have an "api" apiPrefix', async () => {
  const tembaServer = createServer(
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
  expect(apiResponse.text).toBe('It works! ツ')

  const wrongResourceResponse = await request(tembaServer).get('/articles')
  expect(wrongResourceResponse.status).toBe(404)

  const resourceResponse = await request(tembaServer).get('/api/articles')
  expect(resourceResponse.status).toBe(200)
  expect(resourceResponse.body).toEqual([])
})

test('When static file not found, it returns a 404', async () => {
  const tembaServer = createServer(
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
  const tembaServer = createServer(
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

test('Only GET method is allowed for static folder', async () => {
  const tembaServer = createServer({
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
