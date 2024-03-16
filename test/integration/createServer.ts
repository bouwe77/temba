import type { UserConfig } from '../../src/config'
import { create } from '../../src/index'

const createServer = (config?: UserConfig) =>
  create({ ...(config || ({} as UserConfig)), isTesting: true }).Express

export default createServer
