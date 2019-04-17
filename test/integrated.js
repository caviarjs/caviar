const test = require('ava')
const {
  createRequest,
  testNextResources
} = require('./fixtures/complex/create')

const dev = !!process.env.CAVIAR_TEST_IS_DEV
process.env.CAVIAR_APP_TYPE = dev
  ? 'DEV'
  : 'NON_DEV'

test(`simple, dev: ${dev}`, async t => {
  const {request} = await createRequest({
    name: 'simple',
    dev
  })

  const {
    text
  } = await request.get('/say/hello')

  t.is(text, 'hello')

  const {
    text: html
  } = await request.get('/en')

  t.true(html.includes('<div>en</div>'))
  t.true(html.includes('<div>hello</div>'))

  await testNextResources(t, html, request)
})
