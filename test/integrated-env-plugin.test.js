const test = require('ava')

const {
  createRequest,
  testNextResources
} = require('./fixtures/complex/create')

process.env.CAVIAR_INCLUDE_SANDBOX_PLUGIN = 1
process.env.CAVIAR_APP_TYPE = 'FAKE_ENV_PLUGIN'

test(`simple with plugin`, async t => {
  const {get} = await createRequest({
    name: 'simple'
  })

  const {
    text
  } = await get('/say/hello')

  t.is(text, 'dismiss')

  const {
    text: html
  } = await get('/en')

  t.true(html.includes('<div>en</div>'))
  t.true(html.includes('<div>dismiss</div>'))

  await testNextResources(t, html, get)
})
