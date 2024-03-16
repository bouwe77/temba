import type { UserConfig } from '../../src/config'
import { create } from '../../src/index'

const createServer = (config?: UserConfig) => {
  const server = create({ ...(config || ({} as UserConfig)), isTesting: true })
  return server.Express!
}
export default createServer
