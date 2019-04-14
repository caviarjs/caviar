const fs = require('fs')
const {isString, isFunction} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')
const {extend, withPlugins} = require('next-compose-plugins')

const {error} = require('./error')
const {getRawConfig} = require('./utils')

const createFinder = realpath => ({path: p}) => realpath === p

const createNextWithPlugins = config =>
  (...args) => config
    ? extend(config).withPlugins(...args)
    : withPlugins(...args)

// Usage
// ```js
// module.exports = (config, appInfo) => config
// ```
const reduceServerConfigs = chain => appInfo => {
  const {length} = chain
  const run = (serverConfig, i) => {
    if (i === length) {
      return serverConfig
    }

    const {
      config,
      configFile
    } = chain[i]
    if (!('server' in config)) {
      return run(serverConfig, i + 1)
    }

    if (!isFunction(config.server)) {
      throw error('INVALID_CONFIG_SERVER', configFile, config.server)
    }

    return run(config.server(serverConfig, appInfo), i + 1)
  }

  return run({}, 0)
}

module.exports = class ConfigLoader {
  constructor ({
    server,
    cwd
  }) {
    this._server = server
    this._cwd = cwd
    this._paths = null
    this._chain = []
  }

  load () {
    this.getPaths().forEach(({
      serverPath,
      configFileName
    }) => {
      const rawConfig = getRawConfig(serverPath, configFileName)
      if (rawConfig) {
        this._chain.push(rawConfig)
      }
    })
  }

  reload () {
    this._chain.length = 0
    this.load()
  }

  // We deferred the process of merging configurations
  //////////////////////////////////////////////////////
  get plugins () {
    return this._chain.reduce((plugins, {config}) => {
      return config.plugins
        ? plugins.concat(config.plugins)
        : plugins
    }, [])
  }

  get next () {
    const nextConfig = this._chain.reduce((prev, {next}) => {
      if (!next) {
        return prev
      }

      if (!isFunction(next)) {
        throw error('INVALID_CONFIG_NEXT', next)
      }

      // Usage
      // ```js
      // module.exports = withPlugins => withPlugins([...plugins], newConfig)
      // ```
      // withPlugins <- createNextWithPlugins(prev)
      return next(createNextWithPlugins(prev))
    })

    if (!nextConfig) {
      throw error('NEXT_CONFIG_NOT_FOUND')
    }

    // Dont allow webpack in nextConfig
    delete nextConfig.webpack

    return nextConfig
  }


  get server () {
    return reduceServerConfigs(this._chain)
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

      if (paths.findIndex(createFinder(realpath)) === - 1) {
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
