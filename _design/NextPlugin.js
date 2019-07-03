// Plugin
///////////////////////////////////////////////
const NextBlock = require('@caviar/next-block')

// Plugin for NextBlock
class NextFooPlugin {
  constructor () {
    // We can define custom hooks for
    this.hooks = {
      foo: new AsyncParallelHook()
    }
  }

  apply (getHooks) {
    // Get the hooks of the NextBlock instance
    // Thinking:
    // - uses the class name of a block as the identifier?
    // - or use WeakMap ?
    getHooks(NextBlock).webpackConfig.tap('NextFooPlugin', config => {
      await this.hooks.foo.call()
    })
  }
}

// Plugin for NextFooPlugin
class NextFooBarPlugin {
  constructor () {

  }

  apply (getHooks) {
    getHooks(NextFooPlugin).foo.tapPromise('NextFooBarPlugin', async () => {
      await xxxx()
    })
  }
}
