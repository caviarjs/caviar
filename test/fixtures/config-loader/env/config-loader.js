module.exports = class extends require('./config-loader1') {
  get configFile () {
    return require.resolve('./caviar.config')
  }
}
