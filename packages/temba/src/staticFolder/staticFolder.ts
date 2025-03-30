import type { IncomingMessage, ServerResponse } from 'http'
import { handleMethodNotAllowed, handleNotFound, sendErrorResponse } from '../resourceHandler'
import type { Config } from '../config'
import path from 'node:path'
import fs from 'node:fs'
import mime from 'mime/lite'
import { setCorsHeaders } from '../cors/cors'

export type StaticFileInfo = {
  content: Buffer | string
  mimeType: string
}

export type GetStaticFileFromDisk = (filename: string) => StaticFileInfo

const parseError = (e: unknown) => {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') return 'NotFound'
  return 'UnknownError'
}

const allowedMethods = ['GET', 'HEAD']

export const handleStaticFolder = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
  getStaticFileFromDisk: () => StaticFileInfo,
) => {
  if (!req.method || !allowedMethods.includes(req.method)) return handleMethodNotAllowed(req, res)

  try {
    const staticContent = getStaticFileFromDisk()

    res.statusCode = 200
    res.setHeader('Content-Type', staticContent.mimeType)
    setCorsHeaders(res)

    if (typeof staticContent.content === 'string') {
      res.end(staticContent.content)
    } else {
      res.end(staticContent.content)
    }
  } catch (e) {
    return parseError(e) === 'NotFound' ? handleNotFound(req, res) : sendErrorResponse(res)
  }
}

export const createGetStaticFileFromDisk = (config: Config) => {
  return (filename: string): StaticFileInfo => {
    const filePath = path.join(config.staticFolder || '', filename)
    const mimeType = mime.getType(filePath) || 'application/octet-stream'
    const isText = mimeType.startsWith('text/') || mimeType === 'application/json'

    return {
      content: fs.readFileSync(filePath, isText ? 'utf8' : undefined),
      mimeType,
    }
  }
}
