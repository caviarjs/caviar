process.env.INVALID_MIXER = true

const test = require('ava')

const {create} = require('./fixtures/simple/create')

test('invalid mixer', async t => {
  await t.throwsAsync(() => create({}), {
    code: 'INVALID_MIXER'
  })
})
