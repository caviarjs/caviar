const test = require('ava')

const Server = require('../src/server')

test('new', t => {
  t.notThrows(() => new Server({}))
})
