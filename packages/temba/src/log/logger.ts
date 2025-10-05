import type { IncomingMessage, ServerResponse } from 'node:http'
import morgan from 'morgan'

const logLevels = { debug: 0, info: 1, warn: 2, error: 3 } as const
type LogLevel = keyof typeof logLevels
export type Logger = Record<LogLevel, (...data: unknown[]) => void>

const levels = Object.keys(logLevels) as LogLevel[]

const createLogger = (minLevel: LogLevel): Logger => {
  const log = (level: LogLevel, ...data: unknown[]) => {
    if (logLevels[level] < logLevels[minLevel]) return
    try {
      console[level](
        `${new Date().toISOString()} ${level.toUpperCase().padEnd(6)}- ${data.join(' ')}`,
      )
    } catch {
      // Swallow exceptions caused by logging itself
    }
  }
  return Object.fromEntries(levels.map((l) => [l, (...d: unknown[]) => log(l, ...d)])) as Logger
}

const isLogLevel = (v: string | undefined): v is LogLevel => !!v && v in logLevels

export const initLogger = (configured: string | undefined) => {
  const logLevel = isLogLevel(configured) ? configured : 'debug'
  const log = createLogger(logLevel)
  log.debug('Logger initialized')
  return { logLevel, log }
}

const noop = (_: IncomingMessage, __: ServerResponse, next: (err?: unknown) => void) => next()

export const getHttpLogger = (logLevel: LogLevel) =>
  logLevel === 'debug'
    ? morgan(':date[iso] DEBUG - :method :url :status :res[content-length] - :response-time ms')
    : noop
