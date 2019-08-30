const {realpathSync} = require('fs')
const log = require('util').debuglog('caviar')

const {isString} = require('core-util-is')
const hasOwnProperty = require('has-own-prop')

const {
  ConfigGetter,
  PROTECTED_SET_TARGET,
  PROTECTED_SET_PATHS
} = require('./getter')

const error = require('./error')
const {getRawConfig, inspect} = require('../utils')
const {UNDEFINED} = require('../constants')

const checkNodePath = p => {
  if (!isString(p)) {
    throw error('INVALID_NODE_PATH', p)
  }

  return p
}

class ConfigLoader extends ConfigGetter {
  constructor () {
    super()

    this._paths = null
    this._chain = []

    this[PROTECTED_SET_TARGET](this._chain)
    this[PROTECTED_SET_PATHS](['config'])
  }

  // Usage
  // const caviarConfig = config.createSubGetter('caviar')
  // caviarConfig.compose()
  namespace (...namespaces) {
    const sub = new ConfigGetter()
    sub[PROTECTED_SET_TARGET](this._chain)
    sub[PROTECTED_SET_PATHS](['config', ...namespaces])

    return sub
  }

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

    // 1. should has a own property `configFileName`
    // 2. this.configFileName should be a string
    // 3. has a own property `nodePath` or not

    // Loop back for the prototype chain
    while (proto) {
      proto = Object.getPrototypeOf(proto)

      if (!hasOwnProperty(proto, 'configFile')) {
        throw error('CONFIG_FILE_GETTER_REQUIRED')
      }

      const {
        configFile
      } = proto

      if (!isString(configFile)) {
        throw error('INVALID_CONFIG_FILE', configFile)
      }

      // There is no caviar.config.js in caviar,
      // So just stop
      if (proto === ConfigLoader.prototype) {
        break
      }

      const nodePath = hasOwnProperty(proto, 'nodePath')
        ? checkNodePath(proto.nodePath)
        : UNDEFINED

      // if (!isString(caviarPath)) {
      //   throw error('INVALID_PATH', caviarPath)
      // }

      // if (!fs.existsSync(caviarPath)) {
      //   throw error('PATH_NOT_EXISTS', caviarPath)
      // }

      paths.push({
        nodePath: nodePath && realpathSync(nodePath),
        configFile: realpathSync(configFile)
      })
    }

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
      configFile
    }) => {
      const rawConfig = getRawConfig(configFile)
      if (rawConfig) {
        this._chain.push(rawConfig)
      }
    })

    log('config-loader: chain: %s', inspect(this._chain))

    return this
  }
}

module.exports = ConfigLoader
