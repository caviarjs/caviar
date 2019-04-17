module.exports = class extends require('../next/config-loader') {
  get path () {
    return __dirname
  }

  get configFileName () {
    return 'caviar.config'
  }
}
