const path = require('path')

module.exports = class extends require('../../../../src/config/loader') {
  get path () {
    return path.join(__dirname, 'caviar.config')
  }

  get configFileName () {
    return '0'
  }
}
