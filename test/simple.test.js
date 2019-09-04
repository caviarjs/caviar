const test = require('ava')
const {dirname} = require('path')

const {caviar} = require('..')

const configFile = require.resolve('./fixtures/simple/config')

test('caviar', async t => {
  await caviar({
    configFile,
    cwd: dirname(configFile)
  })
  .run()

  t.pass()
})

test('caviar with sandbox', async t => {
  const child = await caviar({
    configFile,
    cwd: dirname(configFile),
    sandbox: true
  })
  .run()

  await child.ready()

  t.pass()
})
