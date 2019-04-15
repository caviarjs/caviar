const path = require('path')
const test = require('ava')
// const log = require('util').debuglog('caviar')
const ConfigLoader = require('../src/config-loader')
const {NEXT_CONFIG_NOT_FOUND} = require('../src/error')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'config-loader', ...args)

test('base: getPaths()', t => {
  const Server = require(fixture('base', 'server.js'))

  const cl = new ConfigLoader({
    cwd: fixture('app'),
    server: new Server()
  })

  t.deepEqual(cl.getPaths(), [
    {
      serverPath: fixture('base'),
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

  t.throws(() => cl.next, NEXT_CONFIG_NOT_FOUND)
})
