const test = require('ava')

const {createAndLoad} = require('./fixtures/complex/create')

test('simple', async t => {
  const {request} = await createAndLoad('simple')

  const {
    text
  } = await request.get('/say/hello')

  t.is(text, 'hello')

  const {
    text: html
  } = await request.get('/en')

  t.true(html.includes('<div>en</div>'))
  t.true(html.includes('<div>hello</div>'))
})
