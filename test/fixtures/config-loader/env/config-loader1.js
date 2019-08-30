const path = require('path')

module.exports = class extends require('./config-loader0') {
  get configFile () {
    return require.resolve('./caviar.config/1')
  }
}
