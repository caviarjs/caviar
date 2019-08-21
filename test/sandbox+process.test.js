const path = require('path')
const test = require('ava')

const {
  Sandbox: S
} = require('../src/sandbox/parent')
const {
  utils: {
    monitor
  }
} = require('../src')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'sandbox', ...args)

const createSandboxClass = name => class extends S {
  get spawner () {
    return fixture(`${name}.js`)
  }
}

test('vanilla Sandbox', t => {
  const s = new S({
    cwd: __dirname,
    dev: true
  })

  t.is(s.spawner,
    path.join(__dirname, '..', 'src', 'sandbox', 'spawner.js'))
})

test('basic', async t => {
  const Sandbox = createSandboxClass('spawner')
  const child = await new Sandbox({
    // configLoaderModulePath: ,
    cwd: __dirname,
    dev: true
  }).run()

  await monitor(child, true)

  t.pass()
})

test('process exit 1', async t => {
  const Sandbox = createSandboxClass('spawner-exit-1')
  const child = await new Sandbox({
    cwd: __dirname,
    dev: true
  }).run()

  await t.throwsAsync(() => monitor(child), {
    code: 'CHILD_PROCESS_NONE_ZERO_EXIT_CODE'
  })
})

// test('process exit', async t => {
//   const Sandbox = createSandboxClass('spawner-exit-0')
//   const child = await new Sandbox({
//     cwd: __dirname,
//     dev: true
//   }).start()

//   await t.throwsAsync(() => monitor(child), {
//     code: 'CHILD_PROCESS_UNEXPECTED_CLOSE'
//   })
// })


// test('exit', async t => {
//   const Sandbox = createSandboxClass('spawner')
//   const child = await new Sandbox({
//     cwd: __dirname,
//     dev: true
//   }).start()

//   setTimeout(() => {
//     child.kill('SIGINT')
//   })

//   await t.throwsAsync(() => monitor(child), {
//     code: 'CHILD_PROCESS_KILLED'
//   })
// })

// test('invalid plugin usage, with config chain', async t => {
//   const Sandbox = createSandboxClass('spawner')

//   await t.throwsAsync(() => new Sandbox({
//     cwd: __dirname,
//     dev: false,
//     configLoaderClassPath: require.resolve(
//       './fixtures/config-loader/error-sandbox-plugin/config-loader')
//   }).start({
//     stdio: 'pipe'
//   }), {
//     code: 'SANDBOX_PRESERVED_ENV_KEY'
//   })
// })
