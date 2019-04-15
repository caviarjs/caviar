const path = require('path')

module.exports = class Server {
  get path () {
    return path.join(__dirname, 'not-exists')
  }

  get configFileName () {
    return 'caviar.config'
  }
}
