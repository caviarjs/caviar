const {
  SyncHook,
  AsyncParallelHook
} = require('tapable')
const {
  FRIEND_SET_RESERVED_HOOKS_FACTORY,
  Hookable
} = require('./base/hookable')

const {createError} = require('./error')
const {createSymbolFor} = require('./utils')

const error = createError('BLOCK')

// The performance of accessing a symbol property or a normal property
// is nearly the same
// https://jsperf.com/normal-property-vs-symbol-prop
const CONFIG_SETTING = Symbol('config')
const CONFIG_VALUE = Symbol('config-value')
// const IS_READY = Symbol('is-ready')
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
  // beforeBuild: new SyncHook(),
  // built: new SyncHook(),
  created: new SyncHook(['outlet', 'caviarOptions']),
  beforeReady: new AsyncParallelHook(['caviarOptions']),
  ready: new AsyncParallelHook(['outlet', 'caviarOptions']),
  config: new SyncHook(['config', 'caviarOptions'])
})

class Block extends Hookable {
  constructor () {
    super()

    this[CONFIG_SETTING] = null
    this[HOOKS] = null
    // this[IS_READY] = false

    this[CONFIG_VALUE] = null
    this[CAVIAR_OPTS] = null

    this[FRIEND_SET_RESERVED_HOOKS_FACTORY](DEFAULT_HOOKS)
  }

  // Set config settings
  set config (config) {
    // TODO: check config
    this[CONFIG_SETTING] = config
  }

  [FRIEND_GET_CONFIG_SETTING] () {
    return this[CONFIG_SETTING]
  }

  [FRIEND_SET_CONFIG_VALUE] (value) {
    this[CONFIG_VALUE] = value
    this.hooks.config.call(value, this[CAVIAR_OPTS])
  }

  [FRIEND_SET_CAVIAR_OPTIONS] (opts) {
    this[CAVIAR_OPTS] = opts
  }

  get outlet () {
    return this[OUTLET]
  }

  async build () {
    await this._build(this[CONFIG_VALUE], this[CAVIAR_OPTS])
    this.hooks.built.call()
  }

  [FRIEND_CREATE] () {
    const outlet = this._create(this[CONFIG_VALUE], this[CAVIAR_OPTS])
    this[OUTLET] = outlet

    this.hooks.created.call(outlet, this[CAVIAR_OPTS])
  }

  async ready () {
    await this.hooks.beforeReady.promise(this[CAVIAR_OPTS])

    const ret = await this._ready(
      this[CONFIG_VALUE], this[CAVIAR_OPTS])

    await this.hooks.ready.promise(ret, this[CAVIAR_OPTS])

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
