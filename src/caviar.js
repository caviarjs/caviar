const {
  SyncHook
} = require('tapable')
const {
  joinEnvPaths
} = require('./utils')
const CaviarBase = require('./base/caviar')

module.exports = class Caviar extends CaviarBase {
  constructor (options) {
    super(options, {
      start: new SyncHook(),
      afterPlugins: new SyncHook(['caviar'])
    })

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

  async run (phase) {
    const hooks = this._hooksManager.getHooks()
    hooks.start.call()

    const Binder = this._caviarConfig.bailBottom('binder')

    const binder = new Binder({
      ...this._options,
      configLoader: this._config,
      hooksManager: this._hooksManager
    })

    await binder.run(phase)
  }
}
