const test = require('ava')
const is = require('is-type-of')

const {
  Server,
  Sandbox,
  ConfigLoader
} = require('..')

test('types', t => {
  t.true(is.class(Server))
  t.true(is.class(Sandbox))
  t.true(is.class(ConfigLoader))
})
