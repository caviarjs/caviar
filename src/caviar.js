const {
  SyncHook,
  AsyncSeriesHook
} = require('tapable')
const {
  joinEnvPaths,
  createPluginFilter
} = require('./utils')
const CaviarBase = require('./base/caviar')
const {
  FRIEND_RUN,
  FRIEND_SET_OPTIONS,

  IS_CHILD_PROCESS,

  createSymbol
} = require('./constants')

const APPLY_NODE_PATHS = createSymbol('apply-node-paths')
const RUN = createSymbol('run')

module.exports = class Caviar extends CaviarBase {
  constructor (options) {
    super(options, {
      start: new SyncHook(),
      beforeConfig: new SyncHook(),
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
    // If wanna to change process.env before loading configFile,
    // you need to enable caviar sandbox and apply a sandbox plugin to do this
    this._config.load()

    this._applyPlugins(createPluginFilter(this[IS_CHILD_PROCESS]))

    const hooks = this._hooksManager.getHooks()
    hooks.beforeConfig.call()
    hooks.start.call()

    const Mixer = this._caviarConfig.bailBottom('mixer')

    const mixer = new Mixer()

    mixer[FRIEND_SET_OPTIONS]({
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

      throw err
    }
  }
}
