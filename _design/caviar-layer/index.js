const {
  ConfigLoader
} = require('caviar')

module.exports = class Layer extends ConfigLoader {
  get configFile () {
    return require.resolve('./config')
  }

  get nodePath () {
    return '../node_modules'
  }
}
