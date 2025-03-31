import type { UserConfig } from '../../src/config'
import { Implementations } from '../../src/implementations'
import { create } from '../../src/index'

export const createServer = (config: UserConfig = {}, implementations?: Implementations) => {
  const server = create({ ...(config || ({} as UserConfig)), isTesting: true, implementations })
  return server.server!
}
