const test = require('ava')
// const log = require('util').debuglog('caviar')

const {fixture, create} = require('./fixtures/config-loader/create')

test('default webpackModule', t => {
  const cl = create('fake-base')
  cl.load()

  t.is(cl.webpackModule, require('webpack'))
})

test('fake webpack module', t => {
  const cl = create('fake-webpack-module')
  cl.load()

  t.is(cl.webpackModule.a, 1)
})

test('no config: loader and app same dir', t => {
  const cl = create('fake-base', 'fake-base')

  t.deepEqual(cl.getPaths(), [{
    serverPath: fixture('fake-base'),
    configFileName: 'caviar.config'
  }], 'should not duplicate')
})
