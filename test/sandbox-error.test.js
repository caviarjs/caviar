const test = require('ava')
const {join} = require('path')

const caviar = require('../src/factory')

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
  }]
]

CASES.forEach(([code, options]) => {
  test(code, t => {
    t.throws(() => caviar(options), {
      code
    })
  })
})
