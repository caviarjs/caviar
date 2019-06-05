// Plugin
///////////////////////////////////////////////
const NextBlock = require('@caviar/next-block')

class NextFooPlugin {
  constructor () {
    // We can define custom hooks for
    this.hooks = {

    }
  }

  apply (getHooks) {
    // Get the hooks of the NextBlock instance
    // Thinking:
    // - uses the class name of a block as the identifier?
    // - or use WeakMap ?
    getHooks(NextBlock).webpackConfig.tap('NextFooPlugin', config => {

    })
  }
}

class NextFooBarPlugin {
  constructor () {

  }

  apply (getHooks) {
    getHooks(NextFooPlugin)
  }
}
