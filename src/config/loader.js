const fs = require('fs')
const log = require('util').debuglog('caviar')

const {isString, isObject} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')

const {createError} = require('../error')
const {getRawConfig, inspect} = require('../utils')

const error = createError('CONFIG_LOADER')
const UNDEFINED = undefined

const createFinder = realpath => ({caviarPath: p}) => realpath === p
const addConfigPath = (paths, {
  caviarPath,
  nodePath,
  configFileName
}, append) => {
  if (paths.findIndex(createFinder(caviarPath)) === - 1) {
    const method = append
      ? 'push'
      : 'unshift'
    paths[method]({
      caviarPath,
      nodePath,
      configFileName
    })
  }
}

const checkNodePath = p => {
  if (!isString(p)) {
    throw error('INVALID_NODE_PATH', p)
  }

  return p
}

const CONFIG_FILE_NAME = 'caviar.config'

class ConfigLoader {
  constructor (options) {
    if (!isObject(options)) {
      throw error('INVALID_OPTIONS', options)
    }

    const {
      cwd
    } = options

    if (!isString(cwd)) {
      throw error('INVALID_CWD', cwd)
    }

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

    // 1. should has a own property `path`
    // 2. this.configFileName should be a string
    // 3. has a own property `nodePath` or not

    // Loop back for the prototype chain
    while (proto) {
      proto = Object.getPrototypeOf(proto)

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

      const nodePath = hasOwnProperty(proto, 'nodePath')
        ? checkNodePath(proto.nodePath)
        : UNDEFINED

      if (!isString(caviarPath)) {
        throw error('INVALID_PATH', caviarPath)
      }

      if (!fs.existsSync(caviarPath)) {
        throw error('PATH_NOT_EXISTS', caviarPath)
      }

      addConfigPath(paths, {
        caviarPath: fs.realpathSync(caviarPath),
        nodePath: nodePath && fs.realpathSync(nodePath),
        configFileName
      }, false)
    }

    addConfigPath(paths, {
      caviarPath: this._cwd,
      configFileName: latestConfigFileName
    }, true)

    log('config-loader: paths: %s', inspect(paths))

    // Caviar.Server::path, ...[SubServer::path]
    // Sequence:
    // - Layer 0: Caviar.Server::path,
    // - ...[SubServer::path]
    //   - Layer 1
    //   - Layer 2
    //   - ...
    //   - Layer for business
    return this._paths = paths
  }

  getNodePaths () {
    return this.getPaths().reduceRight((prev, {nodePath}) => {
      if (nodePath) {
        prev.push(nodePath)
      }

      return prev
    }, [])
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

  // TODO:
  // for now, we could not actually reload depencencies of confi files
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

  // Componse config anchor of kind `key` from each layer
  compose ({
    key,
    compose
  }) {
    return this._chain.reduce((prev, {
      config: {
        [key]: anchor
      },
      configFile
    }) => compose({
      key,
      prev,
      anchor,
      configFile
    }), UNDEFINED)
  }

  // Get plugins
  // Returns `Array`
  get plugins () {
    return this._chain.reduce(
      (plugins, {config}) => config.plugins
        ? plugins.concat(config.plugins)
        : plugins,
      []
    )
  }
}

module.exports = ConfigLoader
