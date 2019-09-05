const test = require('ava')

const {create} = require('./fixtures/simple/create')

test('caviar', async t => {
  await create()

  t.pass()
})

test.only('caviar with sandbox, with sandbox plugin', async t => {
  const child = await create({
    sandbox: true,
    env: {
      TEST_SANDBOX_PLUGIN: 'true'
    }
  })

  await child.ready()

  t.pass()
})
