module.exports = class extends require('../../../../src/config/loader') {
  get path () {
    return __dirname
  }

  get nodePath () {
    return __dirname
  }
}
