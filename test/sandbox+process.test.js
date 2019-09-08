const path = require('path')
const test = require('ava')

const S = require('../src/sandbox/parent')
const createConfigLoader = require('../src/config/create')
const {
  monitor
} = require('..')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'sandbox', ...args)

const configLoader = createConfigLoader({
  cwd: __dirname,
  configFile: fixture('config.js')
})

const createSandboxClass = name => class extends S {
  get spawner () {
    return fixture(`${name}.js`)
  }
}

test('SANDBOX_INVALID_ENV', t => {
  t.throws(() => new S({
    env: false,
    configLoader
  }), {
    code: 'SANDBOX_INVALID_ENV'
  })
})

test('vanilla Sandbox', t => {
  const s = new S({
    cwd: __dirname,
    dev: true,
    configLoader
  })

  t.is(s.spawner,
    path.join(__dirname, '..', 'src', 'sandbox', 'spawner.js'))
})

test('basic', async t => {
  const Sandbox = createSandboxClass('spawner')
  const child = await new Sandbox({
    cwd: __dirname,
    dev: true,
    configLoader
  }).run()

  await monitor(child, true)

  t.pass()
})

test('process exit 1', async t => {
  const Sandbox = createSandboxClass('spawner-exit-1')
  const child = await new Sandbox({
    cwd: __dirname,
    dev: true,
    configLoader
  }).run()

  await t.throwsAsync(() => monitor(child), {
    code: 'CHILD_PROCESS_NONE_ZERO_EXIT_CODE'
  })
})
