const path = require('path')
const test = require('ava')
// const log = require('util').debuglog('caviar')
const ConfigLoader = require('../src/config-loader')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'config-loader', ...args)

test('base: getPaths()', t => {
  const FAKE_BASE = 'fake-base'

  const Server = require(fixture(FAKE_BASE, 'server.js'))

  const cl = new ConfigLoader({
    cwd: fixture('app'),
    server: new Server()
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
  t.deepEqual(cl.env({}), {})

  t.throws(() => cl.next, {
    code: 'NEXT_CONFIG_NOT_FOUND'
  })
})

const ERROR_CASES = [
  ['error-no-path', 'PATH_GETTER_REQUIRED'],
  ['error-number-path', 'INVALID_SERVER_PATH'],
  ['error-path-not-exists', 'SERVER_PATH_NOT_EXISTS'],
  ['error-config-name', 'INVALID_CONFIG_FILE_NAME']
]

ERROR_CASES.forEach(([dir, code]) => {
  test(`error: ${dir}`, t => {
    const Server = require(fixture(dir, 'server.js'))

    const cl = new ConfigLoader({
      cwd: fixture('app'),
      server: new Server()
    })

    t.throws(() => cl.getPaths(), {
      code
    })
  })
})
