const child = require('child_process')

const {createError} = require('../error')
const {
  createSymbol,
  CAVIAR_MESSAGE_COMPLETE
} = require('../constants')
const {
  define,
  defineGetter,
  once
} = require('../utils')

const CHILD_READY = createSymbol('child-ready')

const CHILD_EVENTS = {
  error: createSymbol('child-error'),
  close: createSymbol('child-process')
}

const error = createError('CHILD_PROCESS')

const on = (subprocess, event, handler) => {
  const emitted = subprocess[CHILD_EVENTS[event]]

  if (emitted) {
    handler(...emitted)
    return
  }

  subprocess.on(event, handler)
}

const pre = (subprocess, event) => {
  subprocess.on(event, (...args) => {
    subprocess[CHILD_EVENTS[event]] = args
  })
}

const monitoring = (subprocess, resolve, reject, allowExit) => {
  // It is hard to produce, skip testing
  /* istanbul ignore next */
  on(subprocess, 'error', err => {
    /* istanbul ignore next */
    reject(error('ERRORED', err.stack))
  })

  on(subprocess, 'close', (code, signal) => {
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
}

const monitor = (subprocess, allowExit) =>
  new Promise((resolve, reject) => {
    monitoring(subprocess, ...once(resolve, reject), allowExit)
  })

const ready = (subprocess, allowExit) => {
  if (subprocess.isReady) {
    return
  }

  return new Promise((s, j) => {
    const [resolve, reject] = once(s, j)

    monitoring(subprocess, resolve, reject, allowExit)

    subprocess.on('message', message => {
      if (message && message.type === CAVIAR_MESSAGE_COMPLETE) {
        define(subprocess, CHILD_READY, true)
        resolve()
      }
    })
  })
}

const makeReady = subprocess => {
  defineGetter(subprocess, 'isReady', () => subprocess[CHILD_READY])
  define(subprocess, 'ready', async allowExit => ready(subprocess, allowExit))
}

const fork = (...args) => {
  const subprocess = child.fork(...args)

  pre(subprocess, 'error')
  pre(subprocess, 'close')

  makeReady(subprocess)

  return subprocess
}

module.exports = {
  fork,
  monitor
}
