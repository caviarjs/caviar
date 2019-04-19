module.exports = class extends require('../../../../src/config-loader') {
  get path () {
    return 'foo'
  }

  get nodeModulesPath () {
    return 1
  }

  get configFileName () {
    return 'caviar.config'
  }
}
