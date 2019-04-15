const path = require('path')
const test = require('ava')
// const log = require('util').debuglog('caviar')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'config-loader', ...args)

test('base: getPaths()', t => {
  const FAKE_BASE = 'fake-base'

  const ConfigLoader = require(fixture(FAKE_BASE, 'config-loader.js'))

  const cl = new ConfigLoader({
    cwd: fixture('app')
  })

  t.deepEqual(cl.getPaths(), [
    {
      serverPath: fixture(FAKE_BASE),
      configFileName: 'caviar.config'
    },

    {
      serverPath: fixture('app'),
      configFileName: 'caviar.config'
    }
  ])

  t.deepEqual(cl.plugins, [])

  t.deepEqual(cl.server({
    name: 'app'
  }), {})

  t.deepEqual(cl.webpack({}), {})
  t.deepEqual(cl.env, {
    envs: {},
    clientEnvKeys: new Set()
  })

  t.throws(() => cl.next, {
    code: 'CONFIG_LOADER_NEXT_CONFIG_NOT_FOUND'
  })
})

const ERROR_CASES = [
  ['error-no-path', 'PATH_GETTER_REQUIRED'],
  ['error-number-path', 'INVALID_SERVER_PATH'],
  ['error-path-not-exists', 'SERVER_PATH_NOT_EXISTS'],
  ['error-config-name', 'INVALID_CONFIG_FILE_NAME'],
  ['error-return-value', 'INVALID_RETURN_VALUE', cl => cl.server({})]
]

ERROR_CASES.forEach(([dir, suffix, runner]) => {
  test(`error: ${dir}`, t => {
    const ConfigLoader = require(fixture(dir, 'config-loader.js'))

    const cl = new ConfigLoader({
      cwd: fixture('app')
    })

    const code = `CONFIG_LOADER_${suffix}`

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
