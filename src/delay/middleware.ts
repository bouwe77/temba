const pause = require('connect-pause')

function createDelayMiddleware(delay) {
  return function (req, res, next) {
    console.log('Start delay...')
    pause(delay)(req, res, next)
    console.log('Delay finished!')
  }
}

export { createDelayMiddleware }
