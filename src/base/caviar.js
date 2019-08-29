const {isArray, isString, isObject} = require('core-util-is')
const {resolve} = require('path')

const {
  RETURNS_TRUE,
  PHASE_DEFAULT,
  INSIDE_SANDBOX,
  CAVIAR_MESSAGE_COMPLETE
} = require('../constants')
const {
  requireConfigLoader,
  isSubClass
} = require('../utils')
const {makeReady} = require('../sandbox/parent')
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

    const {
      [INSIDE_SANDBOX]: isInsideSandbox
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

    this[INSIDE_SANDBOX] = !!isInsideSandbox

    this[HOOKS] = hooks

    this._config = this._createConfigLoader(configLoaderModulePath)
    this._caviarConfig = this._config.namespace('caviar')

    this._initHooksManager()
  }

  // @private
  _initHooksManager () {
    this._hooksManager = new HooksManager(this[HOOKS])
  }

  // @private
  _createConfigLoader (configLoaderModulePath) {
    const ConfigLoader = requireConfigLoader(configLoaderModulePath)

    const {cwd} = this._options
    return new ConfigLoader({
      cwd
    })
  }

  // @protected
  // Apply caviar plugins
  // - condition `Function(plugin): boolean` tester to determine
  //     whether the plugin should be applied
  _applyPlugins (condition = RETURNS_TRUE) {
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

  // @private
  // Initialize envs which are essential to caviar
  async _initEnv (phase) {
    if (this[INSIDE_SANDBOX]) {
      return
    }

    const {
      cwd,
      dev
    } = this._options

    // Always ensures the env variables which are essential to caviar,
    // for both sandbox and caviar
    process.env.CAVIAR_CWD = cwd

    if (dev) {
      process.env.CAVIAR_DEV = 'true'
    } else {
      // process.env.FOO = undefined
      // ->
      // console.log(process.env.FOO)  -> 'undefined'
      delete process.env.CAVIAR_DEV
    }

    process.env.CAVIAR_PHASE = phase
  }

  // @public
  async run (phase = PHASE_DEFAULT) {
    if (!isString(phase)) {
      throw error('INVALID_PHASE', phase)
    }

    this._initEnv(phase)

    this._config.load()

    const ret = await this._run(phase)

    if (!this[INSIDE_SANDBOX]) {
      return ret
    }

    // Then `ret` is a child process

    process.send({
      type: CAVIAR_MESSAGE_COMPLETE
    })

    return makeReady(ret)
  }
}
