module.exports = class extends require('./config-loader1') {
  get path () {
    return __dirname
  }

  get configFileName () {
    return 'caviar.config'
  }
}
