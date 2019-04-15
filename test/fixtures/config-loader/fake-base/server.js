module.exports = class Server {
  get path () {
    return __dirname
  }

  get configFileName () {
    return 'caviar.config'
  }
}
