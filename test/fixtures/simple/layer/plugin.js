const {SyncHook} = require('tapable')

const {Plugin} = require('../../../..')
const FooBlock = require('./foo-block')

module.exports = class extends Plugin {
  constructor () {
    super()

    this.hooks = {
      foo: new SyncHook()
    }
  }

  get sandbox () {
    return true
  }

  apply (getHooks) {
    getHooks(FooBlock).a.tap('PLUGIN', () => {
      this.hooks.foo.call()
    })
  }
}
