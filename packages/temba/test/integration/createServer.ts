import { Implementations } from '../../src/implementations'
import { create } from '../../src/index'

export const createServer = async (config: UserConfig = {}, implementations?: Implementations) => {
  const server = await create({
    ...(config || ({} as UserConfig)),
    isTesting: true,
    implementations,
  })
  return server.server!
}
