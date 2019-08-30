module.exports = class extends require('../../../../src/config/loader') {
  get nodePath () {
    return __dirname
  }

  get configFile () {
    return __dirname
  }
}
