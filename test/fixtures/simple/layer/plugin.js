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
    return !!process.env.CAVIAR_SANDBOX
  }

  apply (getHooks) {
    if (process.env.CAVIAR_SANDBOX === 'outer') {
      getHooks().sandboxEnvironment.tapPromise('PLUGIN',
        async sandbox => {
          if (process.env.SET_PRESERVED_ENV_KEY) {
            sandbox.setEnv('CAVIAR_DEV', 'true')
          }

          if (process.env.INHERIT_PRESERVED_ENV_KEY) {
            sandbox.inheritEnv('CAVIAR_DEV')
          }
        }
      )
    }

    getHooks(FooBlock).a.tap('PLUGIN', () => {
      this.hooks.foo.call()
    })
  }
}
