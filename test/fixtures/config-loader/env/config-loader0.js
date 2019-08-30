module.exports = class extends require('../../../../src').ConfigLoader {
  get configFile () {
    return require.resolve('./caviar.config/0')
  }
}
