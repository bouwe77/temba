import { createServer as httpCreateServer } from 'node:http'
import { UserConfig } from '../../src/config'
import { Implementations } from '../../src/implementations'
import { create } from '../../src/index'

const isCustomServerTest = !!process.env.TEMBA_CUSTOM_SERVER

export const CUSTOM_ROUTE = '/temba-custom-route'
export const CUSTOM_ROUTE_BODY = 'Hello from the custom server!'
export const CUSTOM_ROUTE_CONTENT_TYPE = 'text/plain'

export const createServer = async (config: UserConfig = {}, implementations?: Implementations) => {
  const mongoUri = process.env.TEMBA_TEST_MONGODB_URI
  const temba = await create({
    ...(config || ({} as UserConfig)),
    isTesting: true,
    ...(mongoUri ? { connectionString: mongoUri } : {}),
    implementations,
  })

  if (isCustomServerTest) {
    // Wrap Temba in a custom http.Server — this is the pattern being tested.
    // The custom route is handled first; everything else is delegated to Temba.
    const server = httpCreateServer((req, res) => {
      if (req.method === 'GET' && req.url === CUSTOM_ROUTE) {
        res.writeHead(200, { 'Content-Type': CUSTOM_ROUTE_CONTENT_TYPE })
        res.end(CUSTOM_ROUTE_BODY)
        return
      }

      temba.server.emit('request', req, res)
    })

    return server
  }

  return temba.server
}
