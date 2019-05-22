const once = require('once')
const {createError} = require('../error')

const error = createError('CHILD_PROCESS')

const monitor = subprocess => new Promise((_, reject) => {
  reject = once(reject)

  // It is hard to produce, skip testing
  /* istanbul ignore next */
  subprocess.on('error', err => {
    /* istanbul ignore next */
    reject(error('ERRORED', err.stack))
  })

  subprocess.on('close', (code, signal) => {
    if (signal) {
      // Ref
      // http://man7.org/linux/man-pages/man7/signal.7.html
      return reject(error('KILLED', signal))
    }

    if (code) {
      return reject(error('NONE_ZERO_EXIT_CODE', code))
    }

    reject(error('UNEXPECTED_CLOSE'))
  })
})

module.exports = {
  monitor
}
