const fs = require('fs')
const {isString, isFunction, isObject} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')
const {extend, withPlugins} = require('next-compose-plugins')

const {error} = require('./error')
const {getRawConfig} = require('./utils')

const createFinder = realpath => ({path: p}) => realpath === p

const checkResult = (result, field, configFile) => {
  if (!isObject(result)) {
    throw error('INVALID_CONFIG_FUNC_RESULT', field, configFile)
  }

  return result
}

const createNextWithPlugins = config =>
  (...args) => config
    ? extend(config).withPlugins(...args)
    : withPlugins(...args)
const reduceNextConfigs = chain => chain.reduce((prev, {
  config: {
    next
  },
  configFile
}) => {
  if (!next) {
    return prev
  }

  const key = 'next'

  if (!isFunction(next)) {
    throw error('INVALID_CONFIG_FIELD', key, configFile, next)
  }

  const result = createNextWithPlugins(prev)

  // Usage
  // ```js
  // module.exports = withPlugins => withPlugins([...plugins], newConfig)
  // ```
  // withPlugins <- createNextWithPlugins(prev)
  return next(checkResult(result, key, configFile))
}, undefined)

const createConfigChainReducer = ({
  key,
  initConfig,
  runner
}) => chain => (...args) => {
  const {length} = chain
  const run = (prevConfig, i) => {
    if (i === length) {
      return prevConfig
    }

    const {
      config,
      configFile
    } = chain[i]

    if (!(key in config)) {
      return run(prevConfig, i + 1)
    }

    const factory = config[key]

    if (!isFunction(factory)) {
      throw error(`INVALID_CONFIG_FIELD`, key, configFile, factory)
    }

    const result = runner(factory, prevConfig, ...args)

    return run(checkResult(result, key, configFile), i + 1)
  }

  return run(initConfig(...args), 0)
}

// Usage
// ```js
// module.exports = (config, appInfo) => config
// ```
const reduceServerConfigs = createConfigChainReducer({
  key: 'server',
  initConfig () {
    return {}
  },
  runner: (factory, prev, appInfo) => factory(prev, appInfo)
})

const reduceWebpackConfigs = createConfigChainReducer({
  key: 'webpack',
  initConfig: nextWebpackConfig => nextWebpackConfig,
  runner: (factory, prev, _, options, webpack) =>
    factory(prev, options, webpack)
})

const reduceEnvConfigs = createConfigChainReducer({
  key: 'env',
  initConfig (env) {
    return env
  },
  runner: (factory, prev) => factory(prev)
})

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
    this._chain.forEach(({configFileName}) => {
      // delete the require caches, so that the files will be required again
      delete require.cache[configFileName]
    })

    this._chain.length = 0
    this.load()
  }

  // We deferred the process of merging configurations
  //////////////////////////////////////////////////////
  get plugins () {
    return this._chain.reduce(
      (plugins, {config}) => config.plugins
        ? plugins.concat(config.plugins)
        : plugins,
      []
    )
  }

  // Returns `Object` the next config
  get next () {
    const nextConfig = reduceNextConfigs(this._chain)

    if (!nextConfig) {
      throw error('NEXT_CONFIG_NOT_FOUND')
    }

    // Dont allow webpack in nextConfig
    delete nextConfig.webpack

    return nextConfig
  }

  // Returns `Function(appInfo): Object`
  get server () {
    return reduceServerConfigs(this._chain)
  }

  // Returns `Function(nextWebpackConfig, options, webpack): Object`
  get webpack () {
    return reduceWebpackConfigs(this._chain)
  }

  // Returns `Function(env): Object`
  get env () {
    return reduceEnvConfigs(this._chain)
  }
  //////////////////////////////////////////////////////

  get Server () {
    return require('./server')
  }

  getPaths () {
    if (this._paths) {
      return this._paths
    }

    const {Server} = this
    const paths = []

    let proto = this._server

    // Loop back for the prototype chain
    while (proto) {
      proto = Object.getPrototypeOf(proto)

      // Actually, it encountered an abnormal situation,
      // that `this._server` is not an instance of `Server`'s subclass.
      // However, we accept this situation
      if (proto === Object.prototype) {
        break
      }

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

      // stop the loop if we reached Server
      if (proto === Server.prototype) {
        break
      }
    }

    // Caviar.Server::path, ...[SubServer::path]
    return this._paths = paths
  }
}
