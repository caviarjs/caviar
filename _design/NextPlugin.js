// Plugin
///////////////////////////////////////////////
const NextBlock = require('./NextBlock')

class NextXXXPlugin {
  constructor () {

  }

  apply (getHooks) {
    // Get the hooks of the NextBlock instance
    // Thinking:
    // - uses the class name of a block as the identifier?
    // - or use WeakMap ?
    getHooks(NextBlock).webpackConfig.tap('XXXPlugin', config => {

    })
  }
}
