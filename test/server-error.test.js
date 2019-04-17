/* eslint-disable no-underscore-dangle */
const test = require('ava')
const Server = require('../src/server')

const throws = (t, fn, code = '') => {
  t.throws(fn, {
    code: `SERVER_${code}`
  })
}

test('class path not defined', t => {
  const s = new Server({
    cwd: __dirname
  })
  throws(t, () => s._initConfigLoader(), 'INVALID_CLASS_PATH')
})

test('config loader not found', t => {
  const s = new Server({
    cwd: __dirname,
    configLoaderClassPath: 'not-exists'
  })
  throws(t, () => s._initConfigLoader(), 'LOAD_CONFIG_LOADER_FAILS')
})

test('not ready', t => {
  const s = new Server({
    cwd: __dirname
  })
  throws(t, () => s.callback(), 'NOT_READY')
})

test('invalid port', t => {
  const s = new Server({
    cwd: __dirname
  })
  throws(t, () => s.listen(), 'INVALID_PORT')
})
