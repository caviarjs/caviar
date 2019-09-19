const test = require('ava')
const delay = require('delay')

const {create} = require('./fixtures/simple/create')
const {monitor} = require('../')

test('kill', async t => {
  const child = await create({
    sandbox: true,
    env: {
      TEST_PROCESS_KILL: true
    }
  })

  await child.ready()

  await t.throwsAsync(() => {
    const r = monitor(child)
    child.kill()

    return r
  }, {
    code: 'CHILD_PROCESS_KILLED'
  })
})

test('unexpected exit', async t => {
  const child = await create({
    sandbox: true
  })

  await t.throwsAsync(() => monitor(child), {
    code: 'CHILD_PROCESS_UNEXPECTED_CLOSE'
  })
})

test('unexpected exit, delayed monitoring', async t => {
  const child = await create({
    sandbox: true
  })

  await delay(2000)

  await t.throwsAsync(() => monitor(child), {
    code: 'CHILD_PROCESS_UNEXPECTED_CLOSE'
  })
})
