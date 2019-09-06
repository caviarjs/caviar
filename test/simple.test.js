const test = require('ava')

const {create} = require('./fixtures/simple/create')

test('caviar', async t => {
  await create()

  t.pass()
})

const CASES = [
  ['caviar with sandbox, with sandbox plugin', {
    TEST_SANDBOX_PLUGIN: 'true'
  }],
  ['caviar with sandbox, plugin array, plugin factory', {
    TEST_SANDBOX_PLUGIN: 'true',
    TEST_SANDBOX_PLUGIN_VARIES: 'true',
    TEST_SANDBOX_PLUGIN_FACTORY: 'true'
  }],
  [
    'caviar with sandbox, plugin array, condition factory', {
      TEST_SANDBOX_PLUGIN: 'true',
      TEST_SANDBOX_PLUGIN_VARIES: 'true',
      TEST_SANDBOX_PLUGIN_CONDITION_FACTORY: 'true'
    }
  ]
]

const run = ([title, env]) => {
  test(title, async t => {
    const child = await create({
      sandbox: true,
      env
    })

    await child.ready()

    t.pass()
  })
}

CASES.forEach(run)
