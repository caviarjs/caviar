const fs = require('fs')
const {isString} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')
const {extend} = require('next-compose-plugins')

const {error} = require('./error')
const {getRawConfig} = require('./utils')

const finderFactory = realpath => ({path: p}) => realpath === p

module.exports = class ConfigLoader {
  constructor ({
    server,
    cwd
  }) {
    this._server = server
    this._cwd = cwd
    this._paths = null
    this._raw = []
  }

  load () {
    this.getPaths().forEach(({
      serverPath,
      configFileName
    }) => {
      const rawConfig = getRawConfig(serverPath, configFileName)
      if (rawConfig) {
        this._raw.push(rawConfig)
      }
    })
  }

  reload () {
    this._raw.length = 0
    this.load()
  }

  // We deferred the process of real configurations
  //////////////////////////////////////////////////////
  get plugins () {
    return this._raw.reduce((plugins, {config}) => {
      return config.plugins
        ? plugins.concat(config.plugins)
        : plugins
    }, [])
  }

  get next () {

  }

  // Returns ``
  get server () {

  }

  // Returns `Function`
  get webpack () {

  }

  get env () {

  }
  //////////////////////////////////////////////////////

  getPaths () {
    if (this._paths) {
      return this._paths
    }

    const {Server} = require('./server')
    const paths = []

    let proto = this._server

    // Loop back for the prototype chain
    while (proto) {
      proto = Object.getPrototypeOf(proto)

      if (!hasOwnProperty(proto, 'path')) {
        throw error('PATH_GETTER_REQUIRED')
      }

      const {
        path: serverPath,
        // We allow not to override this getter
        configFileName
      } = proto

      if (!isString(serverPath)) {
        throw error('INVALID_SERVER_PATH', serverPath)
      }

      if (!fs.existsSync(serverPath)) {
        throw error('SERVER_PATH_NOT_EXISTS', serverPath)
      }

      if (!isString(configFileName)) {
        throw error('INVALID_CONFIG_NAME', configFileName)
      }

      if (paths.length === 0) {
        paths.push({
          serverPath: this._cwd,
          configFileName
        })
      }

      const realpath = fs.realpathSync(serverPath)

      if (paths.findIndex(finderFactory(realpath)) === - 1) {
        paths.unshift({
          serverPath: realpath,
          configFileName
        })
      }

      // stop the loop if
      // - object extends Object
      // - object extends
      if (proto === Server.prototype) {
        break
      }
    }

    // Caviar.Server::path, ...[SubServer::path]
    return this._paths = paths
  }
}
