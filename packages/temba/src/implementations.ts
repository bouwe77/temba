import type { Config } from './config'
import {
  createGetStaticFileFromDisk,
  type GetStaticFileFromDisk,
} from './staticFolder/staticFolder'

/**
 * @internal
 * Defines the implementations that can be stubbed out for testing purposes.
 */
export type Implementations = {
  getStaticFileFromDisk: GetStaticFileFromDisk
}

export const getDefaultImplementations = (config: Config) => {
  const defaultImplementations: Implementations = {
    getStaticFileFromDisk: createGetStaticFileFromDisk(config),
  }

  if (config.implementations) {
    return {
      ...defaultImplementations,
      ...config.implementations,
    }
  }

  return defaultImplementations
}
