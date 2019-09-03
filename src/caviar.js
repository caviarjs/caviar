const {
  SyncHook,
  AsyncSeriesHook
} = require('tapable')
const {
  joinEnvPaths
} = require('./utils')
const CaviarBase = require('./base/caviar')
const {
  FRIEND_RUN,
  IS_NOT_SANDBOX_PLUGIN,
  IS_CHILD_PROCESS,

  createSymbol
} = require('./constants')

const APPLY_NODE_PATHS = createSymbol('apply-node-paths')
const RUN = createSymbol('run')

module.exports = class Caviar extends CaviarBase {
  constructor (options) {
    super(options, {
      start: new SyncHook(),
      afterPlugins: new SyncHook(['caviar']),
      done: new AsyncSeriesHook(),
      failed: new SyncHook(['error'])
    })

    // Apply NODE_PATH before configLoader.load
    if (!this[IS_CHILD_PROCESS]) {
      // If caviar is runned without sandbox
      this[APPLY_NODE_PATHS]()
    }
  }

  [APPLY_NODE_PATHS] () {
    const {NODE_PATH} = process.env
    process.env.NODE_PATH = joinEnvPaths(NODE_PATH, this._config.getNodePaths())
  }

  async [RUN] (phase) {
    this._applyPlugins(IS_NOT_SANDBOX_PLUGIN)

    const hooks = this._hooksManager.getHooks()
    hooks.start.call()

    // We should load configurations after hooks.start
    this._config.load()

    const Mixer = this._caviarConfig.bailBottom('mixer')

    const mixer = new Mixer({
      ...this._options,
      configLoader: this._config,
      hooksManager: this._hooksManager
    })

    await mixer[FRIEND_RUN](phase)
    await hooks.done.promise()
  }

  async _run (phase) {
    try {
      await this[RUN](phase)
    } catch (err) {
      const hooks = this._hooksManager.getHooks()
      hooks.failed.call(err)
    }
  }
}
