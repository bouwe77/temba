const DEBUG = 'DEBUG'
const INFO = 'INFO'
//TODO Add 'NONE'

export const logLevels = { DEBUG, INFO }

export function createLogger(logLevel) {
  return {
    debug: function (message) {
      try {
        if (logLevel === DEBUG) console.log(new Date(), 'DEBUG -', message)
      } catch {
        //swallow exceptions during logging
      }
    },

    info: function (message) {
      try {
        if (logLevel === DEBUG || logLevel === INFO)
          console.info(new Date(), 'INFO  -', message)
      } catch {
        //swallow exceptions during logging
      }
    },

    error: function (message) {
      try {
        console.error(new Date(), 'ERROR -', message)
      } catch {
        //swallow exceptions during logging
      }
    },
  }
}
