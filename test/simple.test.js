const test = require('ava')

const {create} = require('./fixtures/simple/create')

test('caviar', async t => {
  await create()

  t.pass()
})

test('caviar with sandbox', async t => {
  const child = await create({
    sandbox: true
  })

  await child.ready()

  t.pass()
})
