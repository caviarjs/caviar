const test = require('ava')
// const log = require('util').debuglog('caviar')

const {
  fixture, create, createAndLoad, createAndTestReload
} = require('./fixtures/config-loader/create')

test('default webpackModule', t => {
  const cl = createAndLoad('fake-base')

  t.is(cl.webpackModule, require('webpack'))
})

test('fake webpack module', t => {
  const cl = createAndLoad('fake-webpack-module')

  t.is(cl.webpackModule.a, 1)
})

test('no config: loader and app same dir', t => {
  const cl = create('fake-base', 'fake-base')

  t.deepEqual(cl.getPaths(), [{
    caviarPath: fixture('fake-base'),
    configFileName: 'caviar.config',
    nodePath: fixture('fake-base')
  }], 'should not duplicate')

  t.deepEqual(cl.getNodePaths(), [
    fixture('fake-base')
  ])
})

test('env', t => {
  const cl = createAndLoad('env')

  const {
    envs,
    clientEnvKeys
  } = cl.env

  t.deepEqual(envs, {
    A: '1',
    B: '2',
    C: '3'
  })

  t.deepEqual([...clientEnvKeys.keys()], ['B'])
})

test('env: no converter function', t => {
  const cl = createAndLoad('env-no-converter')

  const {
    envs,
    clientEnvKeys
  } = cl.env

  t.deepEqual(envs, {
    A: '1',
    B: '2'
  })

  t.deepEqual([...clientEnvKeys.keys()], ['B'])
})

test('next', t => {
  const cl = createAndLoad('next')
  const nextConfig = cl.next('phase', {})

  t.deepEqual(nextConfig, {
    distDir: cl.path
  })
})

test('next sub', t => {
  const cl = createAndLoad('next-sub')
  const nextConfig = cl.next('phase', {})

  t.deepEqual(nextConfig, {
    distDir: cl.path
  })
})

test('next extend from an empty base', t => {
  const cl = createAndLoad('next-extends-empty')
  const nextConfig = cl.next('phase', {})

  t.deepEqual(nextConfig, {
    distDir: cl.path
  })
})

test('fake plugins', t => {
  createAndTestReload('fake-plugins')
  .test(cl => {
    const {
      plugins
    } = cl

    t.is(plugins.length, 1)
    t.is(plugins[0].name, 'fake-plugin')
  })
})

test('fake plugins extends empty', t => {
  createAndTestReload('fake-plugins-extends-empty')
  .test(cl => {
    const {
      plugins
    } = cl

    t.is(plugins.length, 1)
    t.is(plugins[0].name, 'fake-plugin')
  })
})

test('server', t => {
  const cl = createAndLoad('server')
  t.deepEqual(cl.server(), {a: 1})
})

test('deeper chain', t => {
  const cl = createAndLoad('deeper')

  t.deepEqual(cl.getPaths(), ['empty', 'server', 'deeper', 'app'].map(name => ({
    caviarPath: fixture(name),
    configFileName: 'caviar.config',
    nodePath: undefined
  })))
})
