const once = require('once')
const {createError} = require('../error')

const {
  createSymbol,
  CAVIAR_MESSAGE_COMPLETE
} = require('../constants')

const error = createError('CHILD_PROCESS')

const monitor = (subprocess, allowExit) => new Promise((resolve, reject) => {
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

    if (allowExit) {
      resolve()
      return
    }

    reject(error('UNEXPECTED_CLOSE'))
  })
})

const CHILD_READY = createSymbol('child-ready')

const ready = subprocess => {
  if (subprocess[CHILD_READY]) {
    return
  }

  return new Promise(resolve => {
    subprocess.on('message', message => {
      if (message && message.type === CAVIAR_MESSAGE_COMPLETE) {
        subprocess[CHILD_READY] = true
        resolve()
      }
    })
  })
}

const makeReady = subprocess => {
  subprocess.then = resolve => {
    ready(subprocess).then(resolve)
  }
}

module.exports = {
  monitor,
  makeReady
}
