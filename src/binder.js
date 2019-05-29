const {
  Block,
  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE
} = require('./block')

const {createError} = require('./error')
// const {createSymbolFor} = require('../utils')

const error = createError('BINDER')

module.exports = class Binder {
  constructor ({
    cwd,
    dev,
    configLoader
  }) {
    this._blocks = null

    this._cwd = cwd
    this._dev = dev
    this._configLoader = configLoader
  }

  set blocks (blocks) {
    this._blocks = blocks
  }

  _createBlock ({
    from: Block,
    configMap
  }) {
    const block = new Block()

    block[FRIEND_SET_CAVIAR_OPTIONS]({
      cwd: this._cwd,
      dev: this._dev
    })

    const configSetting = block[FRIEND_GET_CONFIG_SETTING]()
  }

  ready () {

  }

  _orchestrate () {
    throw error('NOT_IMPLEMENTED', '_orchestrate')
  }
}
