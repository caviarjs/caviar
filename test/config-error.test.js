const test = require('ava')
// const log = require('util').debuglog('caviar')
const {fixture} = require('./fixtures/config-loader/create')
const CL = require('../src/config/loader')

const ERROR_CASES = [
  ['error-no-path', 'PATH_GETTER_REQUIRED'],
  ['error-path-not-exists', 'PATH_NOT_EXISTS'],
  ['error-number-path', 'INVALID_PATH'],
  ['error-number-node-modules', 'INVALID_NODE_PATH'],
  ['error-config-name', 'INVALID_CONFIG_FILE_NAME'],
  // ['error-invalid-webpack', 'INVALID_CONFIG_FIELD', cl => cl.webpack({})],
  // ['error-invalid-env', 'INVALID_CONFIG_FIELD', cl => cl.env],
  // ['error-invalid-next', 'INVALID_CONFIG_FIELD', cl => cl.next],
  // ['error-return-value', 'INVALID_RETURN_VALUE', cl => cl.server({})],
  // ['error-webpack-return-value', 'INVALID_RETURN_VALUE', cl => cl.webpack({})],
  // ['error-next-return-value', 'INVALID_NEXT_RETURN_VALUE', cl => cl.next({})],
  // ['error-env-conflicts', 'ENV_CONFLICTS', cl => cl.env],
  // ['error-config-errored', 'CONFIG_ERRORED', () => {}]
]

const CODE = suffix => `CONFIG_LOADER_${suffix}`

ERROR_CASES.forEach(([dir, suffix, runner]) => {
  test(`error: ${dir}`, t => {
    const ConfigLoader = require(fixture(dir, 'config-loader.js'))

    const cl = new ConfigLoader({
      cwd: fixture('app')
    })

    const code = CODE(suffix)

    t.throws(() => {
      cl.getPaths()

      if (runner) {
        cl.load()
        runner(cl)
      }
    }, {
      code
    })
  })
})

test('invalid options', t => {
  t.throws(() => new CL(), {
    code: CODE('INVALID_OPTIONS')
  })
})

test('invalid cwd', t => {
  t.throws(() => new CL({}), {
    code: CODE('INVALID_CWD')
  })
})
