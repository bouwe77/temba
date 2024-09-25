import type { UserConfig } from '../../src/config'
import { create as createHttp } from '../../src/http-server'

export const createHttpServer = (config?: UserConfig) => {
  const server = createHttp(config)
  const startedServer = server.start()
  return startedServer
}
