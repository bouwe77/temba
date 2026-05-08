import { promises as fs } from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'
import mime from 'mime/lite'
import path from 'node:path'
import type { Config, CorsConfig, StaticFolderConfig } from '../config'
import type { Logger } from '../log/logger'
import { handleNotFound, sendErrorResponse, sendResponse } from '../responseHandler'

/** @internal */
export type StaticFileInfo = {
  content: Buffer
  mimeType: string
}

/** @internal */
export type GetStaticFileFromDisk = (filename: string) => Promise<StaticFileInfo>

type StaticFolderRequest = {
  method: string | undefined
  requestPath: string
  queryString: string
  accept: string | undefined
  staticFolder: StaticFolderConfig
  getStaticFileFromDisk: GetStaticFileFromDisk
}

const parseError = (e: unknown) => {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') return 'NotFound'
  if ((e as NodeJS.ErrnoException).code === 'EISDIR') return 'NotFound'
  return 'UnknownError'
}

const isNotFound = (e: unknown) => parseError(e) === 'NotFound'

const createNotFoundError = () => {
  const error = new Error('Not Found') as NodeJS.ErrnoException
  error.code = 'ENOENT'
  return error
}

const getLastSegment = (requestPath: string) => {
  const parts = requestPath.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

const getStaticFolderPath = (config: Config) => {
  const staticFolder = config.staticFolder as Config['staticFolder'] | string
  return typeof staticFolder === 'string' ? staticFolder : (staticFolder?.path ?? '')
}

const isPathInsideRoot = (root: string, filePath: string) =>
  filePath === root || filePath.startsWith(root + path.sep)

const getPhysicalPath = (requestPath: string) =>
  requestPath === '/' ? 'index.html' : requestPath || 'index.html'

const acceptsHtml = (accept: string | undefined) => accept?.includes('text/html') ?? false

const tryGetStaticFileFromDisk = async (
  getStaticFileFromDisk: GetStaticFileFromDisk,
  filename: string,
) => {
  try {
    return await getStaticFileFromDisk(filename)
  } catch (e) {
    if (isNotFound(e)) return null
    throw e
  }
}

const getDirectoryIndexPath = (requestPath: string) =>
  `${requestPath.replace(/\/$/, '')}/index.html`

const getRedirectLocation = (requestPath: string, queryString: string) =>
  `${requestPath}/${queryString ? `?${queryString}` : ''}`

function* getIndexFallbackPaths(requestPath: string) {
  const trimmedPath = requestPath.replace(/^\/+|\/+$/g, '')
  if (!trimmedPath) {
    yield 'index.html'
    return
  }

  const segments = trimmedPath.split('/').filter(Boolean)
  const directorySegments = requestPath.endsWith('/') ? segments : segments.slice(0, -1)

  for (let i = directorySegments.length; i > 0; i -= 1) {
    yield `/${directorySegments.slice(0, i).join('/')}/index.html`
  }

  yield 'index.html'
}

const resolveStaticFolderRequest = async (
  {
    method,
    requestPath,
    queryString,
    accept,
    staticFolder,
    getStaticFileFromDisk,
  }: StaticFolderRequest,
  log: Logger,
) => {
  try {
    const physicalPath = getPhysicalPath(requestPath)
    const physicalFile = await tryGetStaticFileFromDisk(getStaticFileFromDisk, physicalPath)
    if (physicalFile) return { type: 'file' as const, file: physicalFile }

    if (staticFolder.mode === 'filesystem' || method !== 'GET' || !acceptsHtml(accept)) {
      return { type: 'notFound' as const }
  }

  const lastSegment = getLastSegment(requestPath)
  const shouldCheckDirectoryIndex =
    requestPath !== '/' && !requestPath.endsWith('/') && !lastSegment.includes('.')

    if (shouldCheckDirectoryIndex) {
      const directoryIndexPath = getDirectoryIndexPath(requestPath)
      const directoryIndex = await tryGetStaticFileFromDisk(
        getStaticFileFromDisk,
        directoryIndexPath,
      )
      if (directoryIndex) {
        return {
          type: 'redirect' as const,
          location: getRedirectLocation(requestPath, queryString),
        }
      }
    }

    for (const fallbackPath of getIndexFallbackPaths(requestPath)) {
      const fallbackFile = await tryGetStaticFileFromDisk(getStaticFileFromDisk, fallbackPath)
      if (fallbackFile) return { type: 'file' as const, file: fallbackFile }
    }

    return { type: 'notFound' as const }
  } catch (error) {
    log.info('Error resolving static folder request')
    log.error(error)
    throw error
  }
}

export const createStaticFolderHandler =
  (log: Logger) =>
  async (res: ServerResponse<IncomingMessage>, request: StaticFolderRequest, cors: CorsConfig) => {
    try {
      const result = await resolveStaticFolderRequest(request, log)

      if (result.type === 'notFound') return handleNotFound(res, cors)
      if (result.type === 'redirect') {
        return sendResponse(
          res,
          cors,
        )({
          statusCode: 301,
          headers: { Location: result.location },
        })
      }

      sendResponse(
        res,
        cors,
      )({
        statusCode: 200,
        contentType: result.file.mimeType,
        body: result.file.content,
      })
    } catch (error) {
      log.info('Error handling static folder request on ' + request.requestPath)
      log.error(error)
      return isNotFound(error)
        ? handleNotFound(res, cors)
        : sendErrorResponse(res, 500, 'Internal Server Error', cors)
    }
  }

export const createGetStaticFileFromDisk = (config: Config) => {
  const staticRoot = path.resolve(getStaticFolderPath(config))
  let staticRootRealPathPromise: Promise<string> | null = null

  const getStaticRootRealPath = () => {
    staticRootRealPathPromise = staticRootRealPathPromise ?? fs.realpath(staticRoot)
    return staticRootRealPathPromise
  }

  return async (filename: string): Promise<StaticFileInfo> => {
    const filePath = path.resolve(
      staticRoot,
      filename.startsWith('/') ? filename.slice(1) : filename,
    )

    const [staticRootRealPath, fileRealPath] = await Promise.all([
      getStaticRootRealPath(),
      fs.realpath(filePath),
    ])

    if (!isPathInsideRoot(staticRootRealPath, fileRealPath)) throw createNotFoundError()

    const mimeType = mime.getType(fileRealPath) || 'application/octet-stream'
    let content: Buffer
    try {
      content = await fs.readFile(fileRealPath)
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'EISDIR') throw createNotFoundError()
      throw e
    }

    return {
      content,
      mimeType,
    }
    // } catch (error) {
    //   log.error('Error reading static file from disk', { error, filename })
    //   throw error
    // }
  }
}
