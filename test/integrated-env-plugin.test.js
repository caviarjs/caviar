const test = require('ava')

const {
  createRequest,
  removeWebpackDllCache
} = require('./fixtures/complex/create')

process.env.CAVIAR_APP_TYPE = 'FAKE_ENV_PLUGIN'

test.before(removeWebpackDllCache)

test(`simple with plugin`, async t => {
  const {request} = await createRequest({
    name: 'simple'
  })

  const {
    text
  } = await request.get('/say/hello')

  t.is(text, 'dismiss')

  const {
    text: html
  } = await request.get('/en')

  t.true(html.includes('<div>en</div>'))
  t.true(html.includes('<div>dismiss</div>'))
})
