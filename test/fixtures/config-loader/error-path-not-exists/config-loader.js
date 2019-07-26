const path = require('path')

module.exports = class extends require('../../../../src/config/loader') {
  get path () {
    return path.join(__dirname, 'not-exists')
  }

  get configFileName () {
    return 'caviar.config'
  }
}
