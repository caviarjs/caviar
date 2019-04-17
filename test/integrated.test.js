const test = require('ava')
const {
  createRequest,
  removeWebpackDllCache,
  testNextResources
} = require('./fixtures/complex/create')

const DEVS = [true, false]

test.before(removeWebpackDllCache)

DEVS.forEach(dev => {
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
})
