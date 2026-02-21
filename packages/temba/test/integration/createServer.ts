import { UserConfig } from '../../src/config'
import { Implementations } from '../../src/implementations'
import { create } from '../../src/index'

export const createServer = async (config: UserConfig = {}, implementations?: Implementations) => {
  const mongoUri = process.env.TEMBA_TEST_MONGODB_URI
  const server = await create({
    ...(config || ({} as UserConfig)),
    isTesting: true,
    ...(mongoUri ? { connectionString: mongoUri } : {}),
    implementations,
  })
  return server.server
}
