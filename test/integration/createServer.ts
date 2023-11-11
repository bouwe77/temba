import type { Config } from '../../src/config'
import { create } from '../../src/index'

const createServer = (config?: Config) =>
  create({ ...(config || ({} as Config)), isTesting: true }).Express

export default createServer
