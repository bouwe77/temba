import type { UserConfig } from '../../src/config'
import { create } from '../../src/index'

export const createServer = (config?: UserConfig) => {
  const server = create(config)
  //TODO Ik moet de daadwerkelijke ongestarte http server teruggeven
  // voor supertest. Dus daarvoor expose ik nu ff de server zelf via de server property.
  // Maar wil ik die wel exposen?
  return server.server
  // const startedServer = server.start()
  // return startedServer
}
