import { promises as fs } from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'
import mime from 'mime/lite'
import path from 'node:path'
import type { Config, CorsConfig } from '../config'
import {
  handleNotFound,
  sendErrorResponse,
  sendResponse,
} from '../responseHandler'

export type StaticFileInfo = {
  content: Buffer | string
  mimeType: string
}

export type GetStaticFileFromDisk = (filename: string) => Promise<StaticFileInfo>

const parseError = (e: unknown) => {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') return 'NotFound'
  return 'UnknownError'
}

export const handleStaticFolder = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  getStaticFileFromDisk: () => Promise<StaticFileInfo>,
  cors: CorsConfig,
) => {
  try {
    const staticContent = await getStaticFileFromDisk()
    sendResponse(res, cors)({
      statusCode: 200,
      contentType: staticContent.mimeType,
      body: staticContent.content,
    })
  } catch (e) {
    return parseError(e) === 'NotFound' ? handleNotFound(res, cors) : sendErrorResponse(res, 500, 'Internal Server Error', cors)
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
