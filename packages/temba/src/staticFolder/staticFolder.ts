import type { IncomingMessage, ServerResponse } from 'http'
import { handleMethodNotAllowed, handleNotFound, sendErrorResponse } from '../resourceHandler'
import type { Config } from '../config'
import path from 'node:path'
import fs from 'node:fs'
import mime from 'mime/lite'
import { sendResponse } from '../responseHandler'

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
  res: ServerResponse<IncomingMessage>,
  getStaticFileFromDisk: () => StaticFileInfo,
) => {
  if (!req.method || !allowedMethods.includes(req.method)) return handleMethodNotAllowed(res)

  try {
    const staticContent = getStaticFileFromDisk()
    sendResponse(res)({
      statusCode: 200,
      contentType: staticContent.mimeType,
      body: staticContent.content,
    })
  } catch (e) {
    return parseError(e) === 'NotFound' ? handleNotFound(res) : sendErrorResponse(res)
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
