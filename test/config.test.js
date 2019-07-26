const test = require('ava')
// const log = require('util').debuglog('caviar')
const {composeEnvs} = require('../src/sandbox/parent')

const {
  fixture, create, createAndLoad, createAndTestReload
} = require('./fixtures/config-loader/create')

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

test('env, bailTop, bailBottom, and compose', t => {
  const cl = createAndLoad('env')
  const caviar = cl.namespace('caviar')

  t.deepEqual(caviar.bailTop('envs'), {
    B: 2
  })

  t.deepEqual(caviar.bailBottom('dotenvs'), {
    A: '1'
  })

  t.deepEqual(caviar.compose({
    key: 'dotenvs',
    compose: composeEnvs
  }), {
    A: '1'
  })

  t.deepEqual(caviar.compose({
    key: 'no-exists',
    compose: composeEnvs
  }, 1), 1)

  t.deepEqual(cl.getNodePaths(), [])
})

// test('next extend from an empty base', t => {
//   const cl = createAndLoad('next-extends-empty')
//   const nextConfig = cl.next('phase', {})

//   t.deepEqual(nextConfig, {
//     distDir: cl.path
//   })
// })

// test('fake plugins', t => {
//   createAndTestReload('fake-plugins')
//   .test(cl => {
//     const {
//       plugins
//     } = cl

//     t.is(plugins.length, 1)
//     t.is(plugins[0].name, 'fake-plugin')
//   })
// })
