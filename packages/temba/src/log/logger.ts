import type { IncomingMessage, ServerResponse } from 'node:http'
import morgan from 'morgan'

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
    if (logLevels[level] >= logLevels[logLevel]) {
      try {
        console[level](
          `${new Date().toISOString()} ${level.toUpperCase().padEnd(6, ' ')}- ${data.join(' ')}`,
        )
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

  const log = createLogger(logLevel)

  log.debug('Logger initialized')

  return {
    logLevel,
    log,
  }
}

const noopHandler = (
  _: IncomingMessage,
  __: ServerResponse<IncomingMessage>,
  next: (err?: unknown) => void,
) => next()

export const getHttpLogger = (logLevel: LogLevel) => {
  return logLevel === 'debug'
    ? morgan(':date[iso] DEBUG - :method :url :status :res[content-length] - :response-time ms')
    : noopHandler
}
