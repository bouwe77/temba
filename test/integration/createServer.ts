import type { UserConfig } from '../../src/config'
import { create } from '../../src/index'

export const createServer = (config?: UserConfig) => {
  const server = create({ ...(config || ({} as UserConfig)), isTesting: true })
  return server.server!
}
