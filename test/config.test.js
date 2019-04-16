const path = require('path')
const test = require('ava')
// const log = require('util').debuglog('caviar')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'config-loader', ...args)

const createLoader = (dir, app = 'app') => {
  const ConfigLoader = require(fixture(dir, 'config-loader.js'))

  return new ConfigLoader({
    cwd: fixture(app)
  })
}

test('default webpackModule', t => {
  const cl = createLoader('fake-base')
  cl.load()

  t.is(cl.webpackModule, require('webpack'))
})

test('fake webpack module', t => {
  const cl = createLoader('fake-webpack-module')
  cl.load()

  t.is(cl.webpackModule.a, 1)
})
