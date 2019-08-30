module.exports = class extends require('../../../../src/config/loader') {
  get configFile () {
    return '/foo'
  }
}
