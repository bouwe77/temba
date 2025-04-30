import type { IncomingMessage, ServerResponse } from 'http'
import { handleMethodNotAllowed, handleNotFound, sendErrorResponse } from '../resourceHandler'
import type { Config } from '../config'
import path from 'node:path'
import { promises as fs } from 'fs'
import mime from 'mime/lite'
import { sendResponse } from '../responseHandler'

export type StaticFileInfo = {
  content: Buffer | string
  mimeType: string
}

export type GetStaticFileFromDisk = (filename: string) => Promise<StaticFileInfo>

const parseError = (e: unknown) => {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') return 'NotFound'
  return 'UnknownError'
}

const allowedMethods = ['GET', 'HEAD']

export const handleStaticFolder = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  getStaticFileFromDisk: () => Promise<StaticFileInfo>,
) => {
  if (!req.method || !allowedMethods.includes(req.method)) return handleMethodNotAllowed(res)

  try {
    const staticContent = await getStaticFileFromDisk()
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
  return async (filename: string): Promise<StaticFileInfo> => {
    const filePath = path.join(config.staticFolder || '', filename)
    const mimeType = mime.getType(filePath) || 'application/octet-stream'
    const isText = mimeType.startsWith('text/') || mimeType === 'application/json'

    const content = await fs.readFile(filePath, isText ? 'utf8' : undefined)

    return {
      content,
      mimeType,
    }
  }
}
