import type { UserConfig } from '../../src/config'
import { create, Implementations } from '../../src/index'

export const createServer = (config: UserConfig = {}, implementations?: Implementations) => {
  const server = create({ ...(config || ({} as UserConfig)), isTesting: true, implementations })
  return server.server!
}
