const {
  SyncHook,
  AsyncParallelHook
} = require('tapable')
const {
  isStringArray, defineWritable, define
} = require('./utils')
const {
  Hookable
} = require('./base/hookable')
const {
  FRIEND_SET_RESERVED_HOOKS_FACTORY,

  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE,
  FRIEND_RUN,

  PHASE_DEFAULT,

  createSymbol
} = require('./constants')

const {createError} = require('./error')

const error = createError('BLOCK')

// The performance of accessing a symbol property or a normal property
// is nearly the same
// https://jsperf.com/normal-property-vs-symbol-prop
const CONFIG_SETTING = createSymbol('config')
const CONFIG_VALUE = createSymbol('config-value')
const CREATED = createSymbol('outlet')
const CAVIAR_OPTS = createSymbol('caviar-opts')
const PHASES = createSymbol('phases')

const SHOULD_SKIP_PHASE = createSymbol('should-skip-phase')

const DEFAULT_HOOKS = () => ({
  // TODO: hooks paramaters
  // beforeBuild: new SyncHook(),
  // built: new SyncHook(),
  created: new SyncHook(['outlet', 'caviarOptions']),
  beforeRun: new AsyncParallelHook(['caviarOptions']),
  run: new AsyncParallelHook(['returnValue', 'caviarOptions']),
  config: new SyncHook(['config', 'caviarOptions'])
})

class Block extends Hookable {
  constructor () {
    super()

    defineWritable(this, CREATED)
    this[FRIEND_SET_RESERVED_HOOKS_FACTORY](DEFAULT_HOOKS)
  }

  // Set config settings
  set config (config) {
    // We do not allow the property to change again
    define(this, CONFIG_SETTING, config)
  }

  [FRIEND_GET_CONFIG_SETTING] () {
    return this[CONFIG_SETTING]
  }

  // The config chain is managed by caviar core
  [FRIEND_SET_CONFIG_VALUE] (value) {
    define(this, CONFIG_VALUE, value)
    this.hooks.config.call(value, this[CAVIAR_OPTS])
  }

  set phases (phases) {
    if (!isStringArray(phases)) {
      throw error('INVALID_PHASES', phases)
    }

    define(this, PHASES, phases)
  }

  get phases () {
    // Ensures this.phases
    let phases = this[PHASES]
    if (!phases) {
      phases = [PHASE_DEFAULT]
      define(this, PHASES, phases)
    }

    return phases
  }

  [SHOULD_SKIP_PHASE] () {
    const {phase} = this.options
    // The phase is explicitly disabled in mixer
    return phase === false
    // The phase is not supported by the block
    || !this.phases.includes(phase)
  }

  [FRIEND_SET_CAVIAR_OPTIONS] (opts) {
    define(this, CAVIAR_OPTS, opts)
  }

  get options () {
    return this[CAVIAR_OPTS]
  }

  get created () {
    return this[CREATED]
  }

  [FRIEND_CREATE] () {
    if (this[SHOULD_SKIP_PHASE]()) {
      return
    }

    const {options} = this

    const created = this.create(this[CONFIG_VALUE], options)
    this[CREATED] = created
    this.hooks.created.call(created, options)
  }

  async [FRIEND_RUN] () {
    if (this[SHOULD_SKIP_PHASE]()) {
      return
    }

    const {options} = this
    await this.hooks.beforeRun.promise(options)
    const ret = await this.run(this[CONFIG_VALUE], options)
    await this.hooks.run.promise(ret, options)

    return ret
  }

  create () {
    throw error('NOT_IMPLEMENTED', 'create')
  }

  run () {
    throw error('NOT_IMPLEMENTED', 'run')
  }
}

module.exports = {
  Block
}
