const {isFunction, isArray} = require('core-util-is')
const {
  create: createProxy,
  APPLY_TAPS,
  SET_HOOKS
} = require('tapable-proxy')
const {
  SyncHook
} = require('tapable')

const {error} = require('./error')
const {RETURNS_TRUE} = require('./constants')
const {
  requireModule,
  joinEnvPaths
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

    this._config = new this.ConfigLoader({
      cwd
    })

    this._caviarConfig = this._config.namespace('caviar')

    this._hooksMap = new WeakMap()

    // caviar hooks
    this._hooks = {
      afterPlugins: new SyncHook(['caviar'])
    }

    this.getHooks = this.getHooks.bind(this)

    // Apply NODE_PATH before configLoader.load
    if (!process.env.CAVIAR_SANDBOX) {
      this._applyNodePaths()
    }

    this._config.load()
  }

  _applyNodePaths () {
    const {NODE_PATH} = process.env
    process.env.NODE_PATH = joinEnvPaths(NODE_PATH, this._config.getNodePaths())
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

  // TODO:
  // apply proxied hooks to real hooks
  _applyHooks (Class, hooks) {
    const proxy = this.getHooks(Class)
    proxy[APPLY_TAPS](hooks)

    // For those assigned proxy hooks
    proxy[SET_HOOKS](hooks)

    // If `getHooks()` again, then it will get the real hooks
    this._hooksMap.set(Class, hooks)
  }

  get ConfigLoader () {
    return requireModule(this._configLoaderModulePath)
  }

  async ready () {
    const Binder = this._caviarConfig.bailBottom('binder')

    const binder = new Binder({
      cwd: this._cwd,
      dev: this._dev,
      configLoader: this._config,
      applyHooks: (Block, hooks) => {
        this._applyHooks(Block, hooks)
      }
    })

    await binder.ready()
  }
}


const caviar = options => new Caviar(options)

module.exports = {
  Caviar,
  caviar
}
