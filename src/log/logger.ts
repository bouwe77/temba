type LogLevel = 'debug' | 'info' | 'error'

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  error: 2,
}

export type Logger = Record<LogLevel, (...data: unknown[]) => void>

const createLogger = (logLevel: LogLevel) => {
  const log = (level: LogLevel, ...data: unknown[]) => {
    // Only log when the level is at least as high as the configured log level
    if (logLevels[level] < logLevels[logLevel]) {
      try {
        console[level](new Date(), level, '-', ...data)
      } catch {
        // swallow exceptions during logging
      }
    }
  }

  return {
    debug: (...data: unknown[]) => log('debug', ...data),
    info: (...data: unknown[]) => log('info', ...data),
    error: (...data: unknown[]) => log('error', ...data),
  } as Logger
}

const isInvalid = (value: string | undefined): boolean => {
  return !value || !Object.keys(logLevels).includes(value)
}

export const initLogger = (configuredLogLevel: string | undefined) => {
  const logLevel = isInvalid(configuredLogLevel) ? 'debug' : (configuredLogLevel as LogLevel)

  return {
    logLevel,
    logger: createLogger(logLevel),
  }
}
