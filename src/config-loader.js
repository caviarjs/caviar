const fs = require('fs')
const log = require('util').debuglog('caviar')

const {isString, isFunction, isObject} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')
const {extend, withPlugins} = require('next-compose-plugins')
const caviarWebpackModule = require('webpack')

const {createError} = require('./error')
const {getRawConfig, inspect} = require('./utils')

const error = createError('CONFIG_LOADER')
const UNDEFINED = undefined

const checkResult = (result, field, configFile) => {
  if (!isObject(result)) {
    throw error('INVALID_RETURN_VALUE', field, configFile)
  }

  return result
}

const reduceEnvsConfigs = chain => chain.reduce((prev, {
  config: {
    envs,
    clientEnvs,
    env
  },
  configFile
}) => {
  Object.assign(prev.envs, envs)

  if (clientEnvs) {
    Object.keys(clientEnvs).forEach(key => {
      if (key in envs) {
        throw error('ENV_CONFLICTS', key)
      }

      prev.envs[key] = clientEnvs[key]
      prev.clientEnvKeys.add(key)
    })
  }

  if (!env) {
    return prev
  }

  if (!isFunction(env)) {
    throw error('INVALID_CONFIG_FIELD', 'env', configFile, env)
  }

  prev.envs = checkResult(env(prev.envs), 'env', configFile)

  return prev
}, {
  clientEnvKeys: new Set(),
  envs: {}
})

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

  // Usage
  // ```js
  // module.exports = withPlugins => withPlugins([...plugins], newConfig)
  // ```
  // withPlugins <- createNextWithPlugins(prev)
  const result = next(createNextWithPlugins(prev))

  if (!isFunction(result)) {
    throw error('INVALID_NEXT_RETURN_VALUE', configFile)
  }

  return result
}, UNDEFINED)

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

const createFinder = realpath => ({caviarPath: p}) => realpath === p
const addConfigPath = (paths, {
  caviarPath,
  configFileName
}, append) => {
  if (paths.findIndex(createFinder(caviarPath)) === - 1) {
    const method = append
      ? 'push'
      : 'unshift'
    paths[method]({
      caviarPath,
      configFileName
    })
  }
}

const CONFIG_FILE_NAME = 'caviar.config'

class ConfigLoader {
  constructor ({
    cwd
  }) {
    this._cwd = cwd
    this._paths = null
    this._chain = []
  }

  // Fields for implementors to override
  ///////////////////////////////////////////////////////////
  get path () {
    return __dirname
  }

  get configFileName () {
    return CONFIG_FILE_NAME
  }
  ///////////////////////////////////////////////////////////

  getPaths () {
    if (this._paths) {
      return this._paths
    }

    const paths = []

    let proto = this
    let latestConfigFileName

    // Loop back for the prototype chain
    while (proto) {
      proto = Object.getPrototypeOf(proto)

      // Actually, it encountered an abnormal situation,
      // that `this` is not an instance of `ConfigLoader`'s subclass.
      // However, we accept this situation
      if (proto === Object.prototype) {
        break
      }

      if (!hasOwnProperty(proto, 'path')) {
        throw error('PATH_GETTER_REQUIRED')
      }

      const {
        path: caviarPath,
        // We allow not to override this getter
        configFileName
      } = proto

      if (!isString(configFileName)) {
        throw error('INVALID_CONFIG_FILE_NAME', configFileName)
      }

      // We save name of the latest config file
      latestConfigFileName = configFileName

      // There is no caviar.config.js in caviar,
      // So just stop
      if (proto === ConfigLoader.prototype) {
        break
      }

      if (!isString(caviarPath)) {
        throw error('INVALID_PATH', caviarPath)
      }

      if (!fs.existsSync(caviarPath)) {
        throw error('PATH_NOT_EXISTS', caviarPath)
      }

      const realpath = fs.realpathSync(caviarPath)
      addConfigPath(paths, {
        caviarPath: realpath,
        configFileName
      }, false)
    }

    addConfigPath(paths, {
      caviarPath: this._cwd,
      configFileName: latestConfigFileName
    }, true)

    log('config-loader: paths: %s', inspect(paths))

    // Caviar.Server::path, ...[SubServer::path]
    return this._paths = paths
  }

  load () {
    this.getPaths().forEach(({
      caviarPath,
      configFileName
    }) => {
      const rawConfig = getRawConfig(caviarPath, configFileName)
      if (rawConfig) {
        this._chain.push(rawConfig)
      }
    })

    log('config-loader: chain: %s', inspect(this._chain))
  }

  reload () {
    this._chain.forEach(({configFileName}) => {
      // delete the require caches, so that the files will be required again
      delete require.cache[configFileName]
    })

    this._chain.length = 0
    this.load()
  }

  // Returns a latest defined property
  prop (key, defaultValue) {
    return this._chain.reduceRight(
      (prev, current) => prev || current.config[key],
      UNDEFINED
    )
    || defaultValue
  }

  // We deferred the process of merging configurations
  //////////////////////////////////////////////////////

  // Returns `Array`
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

    return nextConfig
  }

  // Returns `Function(appInfo): Object`
  get server () {
    return reduceServerConfigs(this._chain)
  }

  // Returns `Function(nextWebpackConfig, options, webpack): Object`
  get webpack () {
    // We can specify a version of webpack in the config
    return reduceWebpackConfigs(this._chain)
  }

  // Returns `Webpack`
  get webpackModule () {
    return this.prop('webpackModule', caviarWebpackModule)
  }

  // Returns `Object`
  // - envs `Object` user customized envs
  // - clientEnvKeys `Set` user client env keys
  get env () {
    return reduceEnvsConfigs(this._chain)
  }
  //////////////////////////////////////////////////////
}

module.exports = ConfigLoader
