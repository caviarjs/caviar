const delay = require('delay')
const {SyncHook} = require('tapable')

const {Block} = require('../../src')

module.exports = class KoaBlock extends Block {
  constructor () {
    super()

    this.config = {
      foo: {
        type: 'bailTop'
      }
    }

    this.hooks = {
      a: new SyncHook(['port'])
    }
  }

  create () {
    return {
      foo: true
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
