const test = require('ava')
const {create} = require('./fixtures/simple/create')

process.env.INHERIT_PRESERVED_ENV_KEY = true

test('set reserved env key', async t => {
  await t.throwsAsync(() => create({
    sandbox: true
  }), {
    code: 'SANDBOX_PRESERVED_ENV_KEY'
  })
})
