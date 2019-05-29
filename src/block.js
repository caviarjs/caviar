const {
  SyncHook
} = require('tapable')
const {isObject} = require('core-util-is')

const {createError} = require('./error')
const {createSymbolFor} = require('./utils')

const error = createError('BLOCK')

// The performance of accessing a symbol property or a normal property
// is nearly the same
// https://jsperf.com/normal-property-vs-symbol-prop
const CONFIG_SETTING = Symbol('config')
const CONFIG_VALUE = Symbol('config-value')
const IS_READY = Symbol('is-ready')
const HOOKS = Symbol('hooks')
const OUTLET = Symbol('outlet')
const CAVIAR_OPTS = Symbol('caviar-opts')

const symbolFor = createSymbolFor('block')

const FRIEND_GET_CONFIG_SETTING = symbolFor('get-config-setting')
const FRIEND_SET_CONFIG_VALUE = symbolFor('set-config-value')
const FRIEND_SET_CAVIAR_OPTIONS = symbolFor('set-caviar-opts')
const FRIEND_CREATE = symbolFor('create')

const DEFAULT_HOOKS = () => ({
  // TODO: hooks paramaters
  beforeBuild: new SyncHook(),
  built: new SyncHook(),
  beforeReady: new SyncHook(),
  ready: new SyncHook(),
  config: new SyncHook()
})

const extendHooks = hooks => {
  const ret = {
    ...hooks
  }

  for (const [key, hook] of Object.entries(DEFAULT_HOOKS())) {
    if (key in ret) {
      throw error('RESERVED_HOOK_NAME', key)
    }

    ret[key] = hook
  }

  return ret
}

class Block {
  constructor () {
    this[CONFIG_SETTING] = null
    this[HOOKS] = null
    this[IS_READY] = false

    this[CONFIG_VALUE] = null
    this[CAVIAR_OPTS] = null
  }

  set config (config) {
    // TODO: check config
    this[CONFIG_SETTING] = config
  }

  [FRIEND_GET_CONFIG_SETTING] () {
    return this[CONFIG_SETTING]
  }

  [FRIEND_SET_CONFIG_VALUE] (value) {
    this[CONFIG_VALUE] = value
    this.hooks.config.call(value)
  }

  [FRIEND_SET_CAVIAR_OPTIONS] (opts) {
    this[CAVIAR_OPTS] = opts
  }

  set hooks (hooks) {
    if (!isObject(hooks)) {
      throw error('INVALID_HOOKS', hooks)
    }

    // TODO: check hooks
    // adds default hooks
    this[HOOKS] = extendHooks(hooks)
  }

  get hooks () {
    const hooks = this[HOOKS]
    if (!hooks) {
      throw error('HOOKS_NOT_DEFINED')
    }

    return hooks
  }

  get outlet () {
    return this[OUTLET]
  }

  async build () {
    await this._build(this[CONFIG_VALUE], this[CAVIAR_OPTS])
    this.hooks.built.call()
  }

  [FRIEND_CREATE] () {
    this[OUTLET] = this._create(this[CONFIG_VALUE], this[CAVIAR_OPTS])
  }

  async ready () {
    const ret = await this._ready(
      this[CONFIG_VALUE], this[CAVIAR_OPTS])

    this[IS_READY] = true

    return ret
  }

  _build () {
    throw error('NOT_IMPLEMENTED', '_build')
  }

  _create () {
    throw error('NOT_IMPLEMENTED', '_create')
  }

  _ready () {
    throw error('NOT_IMPLEMENTED', '_ready')
  }
}

module.exports = {
  Block,
  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE
}
