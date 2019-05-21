const NextBlock = require('./NextBlock')

class NextXXXPlugin {
  constructor () {

  }

  apply (getHooks) {
    // Get the hooks of the NextBlock instance
    // Convention:
    // - caviar uses the class name of a block as the identifier
    getHooks(NextBlock).webpackConfig.tap('XXXPlugin', config => {

    })
  }
}
