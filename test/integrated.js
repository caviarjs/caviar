const test = require('ava')
const {
  createRequest,
  testNextResources
} = require('./fixtures/complex/create')

const dev = !!process.env.CAVIAR_TEST_IS_DEV
const mock = process.env.CAVIAR_NO_MOCK
  ? 'NO_MOCK'
  : 'MOCK'

process.env.CAVIAR_APP_TYPE = dev
  ? `DEV-${mock}`
  : `NON_DEV-${mock}`

test(`simple, dev: ${dev}`, async t => {
  const {get} = await createRequest({
    name: 'simple',
    dev,
    mock: !process.env.CAVIAR_NO_MOCK
  })

  const {
    text
  } = await get('/say/hello')

  t.is(text, 'hello')

  const {
    text: html
  } = await get('/en')

  t.true(html.includes('<div>en</div>'))
  t.true(html.includes('<div>hello</div>'))

  await testNextResources(t, html, get)
})
