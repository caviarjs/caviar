const assert = require('assert')
const delay = require('delay')
const {SyncHook} = require('tapable')

const {Block} = require('../../../..')

module.exports = class FooBlock extends Block {
  constructor () {
    super()

    this.config = {
      foo: {
        type: 'bailTop'
      }
    }

    this.hooks = {
      a: new SyncHook(['foo'])
    }

    if (process.env.INVALID_PHASES) {
      this.phases = 1
    }
  }

  create (config) {
    return {
      foo: config.foo === 'foo'
    }
  }

  async run ({foo}) {
    assert(this.created.foo === true, 'block: this.created')

    await delay(100)

    this.hooks.a.call(foo)

    return {
      foo
    }
  }
}
