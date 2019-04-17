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
