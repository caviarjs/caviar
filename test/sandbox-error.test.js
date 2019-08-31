const test = require('ava')

const {Sandbox} = require('../src/sandbox/parent')

test('invalid options', t => {
  t.throws(() => new Sandbox(), {
    code: 'INVALID_OPTIONS'
  })
})

test('invalid cwd', t => {
  t.throws(() => new Sandbox({}), {
    code: 'INVALID_CWD'
  })
})

test('invalid configFile', t => {
  t.throws(() => new Sandbox({
    cwd: 'fake',
    preset: 'fake'
  }), {
    code: 'INVALID_CONFIG_FILE'
  })
})

test('invalid preset', t => {
  t.throws(() => new Sandbox({
    cwd: 'fake',
    preset: 1,
    configFile: 'fake'
  }), {
    code: 'INVALID_PRESET'
  })
})
