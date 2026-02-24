import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createGetStaticFileFromDisk } from '../../../src/staticFolder/staticFolder'

let tmpDir: string

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'temba-test-'))
  await fs.writeFile(path.join(tmpDir, 'index.html'), '<h1>Hello</h1>', 'utf8')
  await fs.writeFile(path.join(tmpDir, 'data.json'), '{"ok":true}', 'utf8')
})

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('createGetStaticFileFromDisk', () => {
  test('serves a file that exists inside the static folder', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    const result = await get('index.html')
    expect(result.content).toContain('<h1>Hello</h1>')
    expect(result.mimeType).toBe('text/html')
  })

  test('serves a file when the URL path has a leading slash', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    const result = await get('/index.html')
    expect(result.content).toContain('<h1>Hello</h1>')
  })

  test('throws ENOENT for a file that does not exist inside the folder', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    await expect(get('missing.html')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  describe('path traversal prevention', () => {
    test('blocks a simple ../ traversal', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      await expect(get('../etc/passwd')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('blocks traversal with a leading slash and ../..', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      await expect(get('/../../etc/passwd')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('blocks traversal that resolves to the parent directory', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      // Resolves to the parent of tmpDir
      await expect(get('../')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('blocks traversal with encoded-looking path segments (raw dots)', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      await expect(get('subdir/../../etc/passwd')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('allows a legitimate nested file if it exists', async () => {
      // Create a subdirectory with a file to confirm non-traversal paths work
      const subDir = path.join(tmpDir, 'assets')
      await fs.mkdir(subDir, { recursive: true })
      await fs.writeFile(path.join(subDir, 'style.css'), 'body {}', 'utf8')

      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      const result = await get('assets/style.css')
      expect(result.content).toBe('body {}')
      expect(result.mimeType).toBe('text/css')
    })
  })
})
