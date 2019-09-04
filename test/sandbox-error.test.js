const test = require('ava')

const {Sandbox} = require('../src/sandbox/parent')

const CASES = [
  ['INVALID_OPTIONS'],
  ['INVALID_CWD', {}],
  ['OPTION_MISSING', {
    cwd: 'fake'
  }],
  ['INVALID_CONFIG_FILE', {
    cwd: 'fake',
    preset: 'fake',
    configFile: 1
  }],
  ['INVALID_PRESET', {
    cwd: 'fake',
    preset: 1,
    configFile: 'fake'
  }],
  ['SANDBOX_INVALID_ENV', {
    cwd: 'fake',
    configFile: 'fake',
    env: false
  }]
]

CASES.forEach(([code, options]) => {
  test(code, t => {
    t.throws(() => new Sandbox(options), {
      code
    })
  })
})
