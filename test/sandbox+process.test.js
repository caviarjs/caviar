const path = require('path')
const test = require('ava')

const {
  Sandbox: S,
  utils: {monitor}
} = require('../src')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'sandbox', ...args)

const createSandboxClass = name => class extends S {
  get spawner () {
    return fixture(`${name}.js`)
  }
}

test('basic', async t => {
  const Sandbox = createSandboxClass('spawner')
  await new Sandbox({
    cwd: __dirname,
    dev: true
  }).start()

  t.pass()
})

test('process exit 1', async t => {
  const Sandbox = createSandboxClass('spawner-exit')
  const child = await new Sandbox({
    cwd: __dirname,
    dev: true
  }).start()

  await t.throwsAsync(() => monitor(child), {
    code: 'CHILD_PROCESS_NONE_ZERO_EXIT_CODE'
  })
})


// test('not exists', async t => {
//   const Sandbox = createSandboxClass('spawner-not-exists')
//   const child = await new Sandbox({
//     cwd: __dirname,
//     dev: true
//   }).start()

//   await t.throwsAsync(() => monitor(child), {
//     code: 'CHILD_PROCESS_ERROR'
//   })
// })
