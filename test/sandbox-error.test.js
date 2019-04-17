const test = require('ava')

const {Sandbox} = require('../src')

const CODE = suffix => `SANDBOX_${suffix}`

test('invalid options', t => {
  t.throws(() => new Sandbox(), {
    code: CODE('INVALID_OPTIONS')
  })
})

test('invalid cwd', t => {
  t.throws(() => new Sandbox({}), {
    code: CODE('INVALID_CWD')
  })
})

test('invalid server path', t => {
  t.throws(() => new Sandbox({
    serverClassPath: null,
    cwd: __dirname
  }), {
    code: CODE('INVALID_SERVER_CLASS_PATH')
  })
})

test('invalid loader path', t => {
  t.throws(() => new Sandbox({
    configLoaderClassPath: null,
    cwd: __dirname
  }), {
    code: CODE('INVALID_CONFIG_LOADER_CLASS_PATH')
  })
})
