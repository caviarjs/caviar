module.exports = class extends require('../server/config-loader') {
  get path () {
    return __dirname
  }

  get configFileName () {
    return 'caviar.config'
  }
}
