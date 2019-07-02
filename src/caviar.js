const {
  SyncHook
} = require('tapable')
const {isString} = require('core-util-is')
const {
  joinEnvPaths
} = require('./utils')
const CaviarBase = require('./base/caviar')
const {
  PHASE_DEFAULT,
  FRIEND_RUN
} = require('./constants')
const {error} = require('./error')

module.exports = class Caviar extends CaviarBase {
  constructor (options) {
    super(options, {
      start: new SyncHook(),
      afterPlugins: new SyncHook(['caviar'])
    })

    // Apply NODE_PATH before configLoader.load
    if (!process.env.CAVIAR_SANDBOX) {
      // If caviar is runned without sandbox
      this._applyNodePaths()
    }

    this._config.load()
  }

  _applyNodePaths () {
    const {NODE_PATH} = process.env
    process.env.NODE_PATH = joinEnvPaths(NODE_PATH, this._config.getNodePaths())
  }

  async run (phase = PHASE_DEFAULT) {
    if (!isString(phase)) {
      throw error('INVALID_PHASE', phase)
    }

    const hooks = this._hooksManager.getHooks()
    hooks.start.call()

    const Binder = this._caviarConfig.bailBottom('binder')

    const binder = new Binder({
      ...this._options,
      configLoader: this._config,
      hooksManager: this._hooksManager
    })

    await binder[FRIEND_RUN](phase)
  }
}
