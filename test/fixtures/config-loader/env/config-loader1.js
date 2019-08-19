const path = require('path')

module.exports = class extends require('./config-loader0') {
  get path () {
    return path.join(__dirname, 'caviar.config')
  }

  get configFileName () {
    return '1'
  }
}
