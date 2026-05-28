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
  await fs.writeFile(path.join(tmpDir, 'app.js'), 'console.log("ok")', 'utf8')
  await fs.writeFile(path.join(tmpDir, 'style.css'), 'body {}', 'utf8')
  await fs.writeFile(path.join(tmpDir, 'icon.svg'), '<svg />', 'utf8')
  await fs.writeFile(path.join(tmpDir, 'image.webp'), Buffer.from('webp image'))
})

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('createGetStaticFileFromDisk', () => {
  test('serves a file that exists inside the static folder', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    const result = await get('index.html')
    expect(result.content.toString()).toContain('<h1>Hello</h1>')
    expect(result.mimeType).toBe('text/html')
  })

  test('serves a file when staticFolder is configured as a path object', async () => {
    const get = createGetStaticFileFromDisk({
      staticFolder: { path: tmpDir, mode: 'spa' },
    } as never)
    const result = await get('index.html')
    expect(result.content.toString()).toContain('<h1>Hello</h1>')
    expect(result.mimeType).toBe('text/html')
  })

  test('serves a file when the URL path has a leading slash', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    const result = await get('/index.html')
    expect(result.content.toString()).toContain('<h1>Hello</h1>')
  })

  test('throws ENOENT for a file that does not exist inside the folder', async () => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    await expect(get('missing.html')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  test.each([
    ['app.js', 'text/javascript'],
    ['style.css', 'text/css'],
    ['icon.svg', 'image/svg+xml'],
    ['image.webp', 'image/webp'],
  ])('detects the %s mime type', async (filename, mimeType) => {
    const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
    const result = await get(filename)
    expect(result.mimeType).toBe(mimeType)
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

    test('blocks requests that resolve to the static folder root itself', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      await expect(get('')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('blocks traversal with encoded-looking path segments (raw dots)', async () => {
      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      await expect(get('subdir/../../etc/passwd')).rejects.toMatchObject({ code: 'ENOENT' })
    })

    test('blocks a symlink that resolves outside the static folder', async () => {
      const outsideFile = path.join(os.tmpdir(), `temba-outside-${Date.now()}.txt`)
      const symlinkPath = path.join(tmpDir, 'outside-link.txt')
      await fs.writeFile(outsideFile, 'outside', 'utf8')

      try {
        await fs.symlink(outsideFile, symlinkPath)
      } catch (e) {
        const code = (e as NodeJS.ErrnoException).code
        if (code === 'EPERM' || code === 'ENOTSUP') return
        throw e
      }

      try {
        const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
        await expect(get('outside-link.txt')).rejects.toMatchObject({ code: 'ENOENT' })
      } finally {
        await fs.rm(outsideFile, { force: true })
        await fs.rm(symlinkPath, { force: true })
      }
    })

    test('allows a legitimate nested file if it exists', async () => {
      // Create a subdirectory with a file to confirm non-traversal paths work
      const subDir = path.join(tmpDir, 'assets')
      await fs.mkdir(subDir, { recursive: true })
      await fs.writeFile(path.join(subDir, 'style.css'), 'body {}', 'utf8')

      const get = createGetStaticFileFromDisk({ staticFolder: tmpDir } as never)
      const result = await get('assets/style.css')
      expect(result.content.toString()).toBe('body {}')
      expect(result.mimeType).toBe('text/css')
    })
  })
})
