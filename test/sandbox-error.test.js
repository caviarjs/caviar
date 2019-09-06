const test = require('ava')
const {join} = require('path')

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
  ['PRESET_NOT_FOUND', {
    cwd: 'fake',
    preset: 'fake'
  }],
  ['LOAD_PRESET_FAILS', {
    cwd: 'fake',
    preset: join(__dirname, 'fixtures', 'simple', 'preset')
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
