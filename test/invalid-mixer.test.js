const test = require('ava')

const {create} = require('./fixtures/simple/create')

test('invalid mixer', async t => {
  await t.throwsAsync(() => create({
    env: {
      INVALID_MIXER: 'true'
    }
  }), {
    code: 'INVALID_MIXER'
  })
})
