module.exports = class extends require('../empty/config-loader') {
  get path () {
    return __dirname
  }

  get configFileName () {
    return 'caviar.config'
  }
}
