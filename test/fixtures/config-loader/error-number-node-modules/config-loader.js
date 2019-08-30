module.exports = class extends require('../../../../src/config/loader') {
  get nodePath () {
    return 1
  }

  get configFile () {
    return 'invalid config file'
  }
}
