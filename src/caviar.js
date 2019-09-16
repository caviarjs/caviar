const {
  SyncHook,
  AsyncSeriesHook
} = require('tapable')
const {isFunction} = require('core-util-is')
const {createPluginFilter} = require('./utils')
const CaviarBase = require('./base/caviar')
const {
  FRIEND_RUN,
  FRIEND_SET_OPTIONS,

  IS_CHILD_PROCESS,

  createSymbol
} = require('./constants')
const {error} = require('./error')

const RUN = createSymbol('run')

module.exports = class Caviar extends CaviarBase {
  constructor (options) {
    super(options, {
      start: new SyncHook(),
      beforeConfig: new SyncHook(),
      done: new AsyncSeriesHook(),
      failed: new SyncHook(['error'])
    })

    this._applyNodePaths(process.env)
  }

  async [RUN] (phase) {
    // If wanna to change process.env before loading configFile,
    // you need to enable caviar sandbox and apply a sandbox plugin to do this
    this._config.load()

    this._applyCaviarEnv(process.env)

    this._applyPlugins(createPluginFilter(this[IS_CHILD_PROCESS]))

    const hooks = this._hooksManager.getHooks()

    hooks.start.call()

    const Mixer = this._caviarConfig.bailBottom('mixer')

    if (!isFunction(Mixer)) {
      throw error('INVALID_MIXER', Mixer)
    }

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
