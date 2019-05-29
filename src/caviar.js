const {isFunction, isArray} = require('core-util-is')
const {
  create: createProxy,
  APPLY_TAPS
} = require('tapable-proxy')
const {
  SyncHook
} = require('tapable')

const {error} = require('./error')
const {RETURNS_TRUE} = require('./constants')
const {
  requireModule
} = require('./utils')

const DEFAULT_CONFIG_LOADER_MODULE_PATH = require.resolve('./config/loader')

const composePlugins = ({
  // key,
  prev = [],
  anchor,
  configFile
}) => {
  if (!isArray(anchor)) {
    throw error('INVALID_PLUGINS', anchor, configFile)
  }

  return prev.concat(anchor)
}

class Caviar {
  constructor ({
    cwd,
    dev,
    configLoaderModulePath = DEFAULT_CONFIG_LOADER_MODULE_PATH
  }) {
    this._cwd = cwd
    this._dev = !!dev
    this._configLoaderModulePath = configLoaderModulePath

    this._config = new this.ConfigLoader()
    this._caviarConfig = this._config.namespace('caviar')

    this._hooksMap = new WeakMap()

    // caviar hooks
    this._hooks = {
      afterPlugins: new SyncHook(['caviar'])
    }

    this.getHooks = this.getHooks.bind(this)
  }

  // Apply caviar plugins
  // - condition `Function(plugin): boolean` tester to determine
  //     whether the plugin should be applied
  applyPlugins (condition = RETURNS_TRUE) {
    const plugins = this._caviarConfig.compose({
      key: 'plugins',
      compose: composePlugins
    }, [])

    plugins
    .filter(condition)
    .forEach(plugin => plugin.apply(this.getHooks))

    return this
  }

  getHooks (Class) {
    // Caviar hooks
    if (arguments.length === 0) {
      return this._hooks
    }

    if (!isFunction(Class)) {
      throw error('')
    }


    if (this._hooksMap.has(Class)) {
      return this._hooksMap.get(Class)
    }

    const hooksProxy = createProxy()
    this._hooksMap.set(Class, hooksProxy)

    return hooksProxy
  }

  get ConfigLoader () {
    return requireModule(this._configLoaderModulePath)
  }

  async build () {

  }

  async ready () {
    this._config.load()
    const Binder = this._caviarConfig.bailBottom('binder')


  }
}


const caviar = options => new Caviar(options)

module.exports = {
  Caviar,
  caviar
}
