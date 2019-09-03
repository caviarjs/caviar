const test = require('ava')
const is = require('is-type-of')

const {
  ConfigLoader, Block, Mixer, Plugin
} = require('..')

test('types', t => {
  t.true(is.class(ConfigLoader))
  t.true(is.class(Block))
  t.true(is.class(Mixer))
  t.true(is.class(Plugin))
})
