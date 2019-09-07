const test = require('ava')
// const log = require('util').debuglog('caviar')
const {composeEnvs} = require('../src/utils')

const {
  fixture, create, createAndLoad
} = require('./fixtures/config-loader/create')

test('no config: loader and app same dir', t => {
  const cl = create('fake-base')

  const nodePath = fixture('fake-base')

  t.deepEqual(cl.getPaths(), [{
    configFile: nodePath,
    nodePath
  }, {
    configFile: nodePath,
    nodePath
  }])

  t.deepEqual(cl.getNodePaths(), [
    nodePath
  ], 'shoud not duplicate')
})

test('env, bailTop, bailBottom, and compose', t => {
  const cl = createAndLoad('env')
  const caviar = cl.namespace('caviar')

  t.deepEqual(caviar.bailTop('envs'), {
    B: 2
  })

  t.deepEqual(caviar.bailBottom('envs'), {
    B0: 2
  })

  t.deepEqual(caviar.compose({
    key: 'no-exists',
    compose: composeEnvs
  }, 1), 1)

  t.deepEqual(cl.getNodePaths(), [])
})
