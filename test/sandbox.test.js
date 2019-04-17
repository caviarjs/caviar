const path = require('path')
const test = require('ava')

const {Sandbox: S} = require('../src')

const fixture = (...args) =>
  path.join(__dirname, 'fixtures', 'sandbox', ...args)

const createSandboxClass = name => class extends S {
  get spawner () {
    return fixture(`${name}.js`)
  }
}

test('basic', async t => {
  const Sandbox = createSandboxClass('spawner')
  const child = await new Sandbox({
    cwd: __dirname
  }).start()

  t.pass()
})
