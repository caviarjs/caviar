const {isArray, isString, isObject} = require('core-util-is')
const {resolve} = require('path')

const {
  RETURNS_TRUE,
  PHASE_DEFAULT,
  IS_CHILD_PROCESS,
  IS_SANDBOX,
  CAVIAR_MESSAGE_COMPLETE
} = require('../constants')
const {
  requirePreset,
  isSubClass
} = require('../utils')
const {makeReady} = require('../sandbox/process')
const {HooksManager, Hookable} = require('../base/hookable')
const {createConfigLoaderClass} = require('../config/create')
const ConfigLoader = require('../config/loader')
const {error} = require('../error')

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

    let {
      cwd,
      dev
    } = options

    if (!isString(cwd)) {
      throw error('INVALID_CWD', cwd)
    }

    const {
      preset,
      configFile,
      [IS_CHILD_PROCESS]: isChildProcess
    } = options

    cwd = resolve(cwd)
    dev = !!dev

    this._options = {
      cwd,
      dev
    }

    this[IS_CHILD_PROCESS] = !!isChildProcess

    this[HOOKS] = hooks

    this._config = this._createConfigLoader(preset, configFile)
    this._caviarConfig = this._config.namespace('caviar')

    this._initHooksManager()
  }

  // @private
  _initHooksManager () {
    this._hooksManager = new HooksManager(this[HOOKS])
  }

  // @private
  _createConfigLoader (preset, configFile) {
    if (!isString(configFile)) {
      throw error('INVALID_CONFIG_FILE', configFile)
    }

    const PresetClass = requirePreset(this._options.cwd, preset)
      // If there is no preset
      || ConfigLoader

    const Extended = createConfigLoaderClass(PresetClass, configFile)

    return new Extended()
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
    // If the caviar instance is inside sandbox,
    // env variables below are already been defined in
    // options.env of the child process
    if (this[IS_CHILD_PROCESS]) {
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

    // If caviar is in a child process
    if (this[IS_CHILD_PROCESS]) {
      process.send({
        type: CAVIAR_MESSAGE_COMPLETE
      })

      return
    }

    // Caviar could run without a sandbox,
    // only monitor the parent process when the current instance is a sandbox
    if (this[IS_SANDBOX]) {
      return makeReady(ret)
    }
  }
}
