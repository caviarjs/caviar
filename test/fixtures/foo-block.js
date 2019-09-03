const delay = require('delay')
const {SyncHook} = require('tapable')

const {Block} = require('../..')

module.exports = class KoaBlock extends Block {
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
  }

  create (config) {
    return {
      foo: config.foo === 'foo'
    }
  }

  async run ({foo}) {
    await delay(100)

    this.hooks.a.call(foo)

    return {
      foo
    }
  }
}
