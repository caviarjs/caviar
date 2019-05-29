const fs = require('fs')
const path = require('path')
const log = require('util').debuglog('caviar')

const {isString, isObject} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')

const {
  ConfigGetter,
  PROTECTED_SET_TARGET,
  PROTECTED_SET_PATHS
} = require('./getter')

const error = require('./error')
const {getRawConfig, inspect} = require('../utils')
const {UNDEFINED} = require('../constants')

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

class ConfigLoader extends ConfigGetter {
  constructor (options) {
    super()

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
    this._pkg = null
    this._paths = null
    this._chain = []

    this[PROTECTED_SET_TARGET](this._chain)
    this[PROTECTED_SET_PATHS](['config'])
  }

  // Usage
  // const caviarConfig = config.createSubGetter('caviar')
  // caviarConfig.compose()
  namespace (namespace) {
    const sub = new ConfigGetter()
    sub[PROTECTED_SET_TARGET](this._chain)
    sub[PROTECTED_SET_PATHS](['config', namespace])

    return sub
  }

  get pkg () {
    if (this._pkg) {
      return this._pkg
    }

    const packageFilepath = path.join(this._cwd, 'package.json')

    try {
      return this._pkg = require(packageFilepath)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        throw error('PKG_NOT_FOUND', this._cwd)
      }

      throw error('LOAD_PKG_FAILED', this._cwd, err)
    }
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

  // Caviar.Server::path, ...[SubServer::path]
  // TOP
  //  ^      - Layer for business
  //  |      - ...
  //  |      - Layer 2
  //  |      - Layer 1: [SubServer::path]    -> paths[1]
  //  |      - Layer 0: Caviar.Server::path  -> paths[0]
  // BOTTOM
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
}

module.exports = ConfigLoader
