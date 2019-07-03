const {isArray, isString, isObject} = require('core-util-is')
const {resolve} = require('path')

const {
  RETURNS_TRUE,
  UNDEFINED
} = require('../constants')
const {
  requireConfigLoader,
  isSubClass
} = require('../utils')
const {HooksManager, Hookable} = require('../base/hookable')
const {error} = require('../error')

const DEFAULT_CONFIG_LOADER_MODULE_PATH = require.resolve('../config/loader')
const HOOKS = Symbol('hooks')

const composePlugins = ({
  // key,
  prev = [],
  anchor,
  configFile
}) => {
  if (!isArray(anchor)) {
    throw error('CONFIG_LOADER_INVALID_PLUGINS', configFile, anchor)
  }

  return prev.concat(anchor)
}

module.exports = class CaviarBase {
  constructor (options, hooks = {}) {
    if (!isObject(options)) {
      throw error('INVALID_OPTIONS', options)
    }

    const {
      configLoaderModulePath = DEFAULT_CONFIG_LOADER_MODULE_PATH
    } = options

    let {
      cwd,
      dev
    } = options

    if (!isString(cwd)) {
      throw error('INVALID_CWD', cwd)
    }

    cwd = resolve(cwd)
    dev = !!dev

    this._options = {
      cwd,
      dev
    }

    // Always ensures the env variables which are essential to caviar,
    // for both sandbox and caviar
    process.env.CAVIAR_CWD = cwd
    process.env.CAVIAR_DEV = dev || UNDEFINED

    this[HOOKS] = hooks

    this._config = this._createConfigLoader(configLoaderModulePath)
    this._caviarConfig = this._config.namespace('caviar')

    this._initHooksManager()
  }

  _initHooksManager () {
    this._hooksManager = new HooksManager(this[HOOKS])
  }

  _createConfigLoader (configLoaderModulePath) {
    const ConfigLoader = requireConfigLoader(configLoaderModulePath)

    const {cwd} = this._options
    return new ConfigLoader({
      cwd
    })
  }

  // Apply caviar plugins
  // - condition `Function(plugin): boolean` tester to determine
  //     whether the plugin should be applied
  applyPlugins (condition = RETURNS_TRUE) {
    const plugins = this._caviarConfig.compose({
      key: 'plugins',
      compose: composePlugins
    }, [])

    const hooksManager = this._hooksManager
    const {getHooks} = hooksManager

    plugins
    .filter(condition)
    .forEach(plugin => {
      const {
        constructor,
        hooks
      } = plugin

      // Handle sub hooks of a plugin
      // If the plugin is a Hookable, and has hooks,
      // then apply the proxies
      if (isSubClass(constructor, Hookable) && hooks) {
        hooksManager.applyHooks(constructor, hooks)
      }

      plugin.apply(getHooks)
    })

    return this
  }
}
