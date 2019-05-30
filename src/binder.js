const {
  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE
} = require('./block')
const {UNDEFINED} = require('./constants')

const {createError} = require('./error')
// const {createSymbolFor} = require('../utils')

const error = createError('BINDER')

const createConfigMap = configSetting => {
  const map = Object.create(null)
  for (const key of Object.keys(configSetting)) {
    map[key] = key
  }

  return map
}

const AVAILABLE_CONFIG_GETTER_TYPES = [
  'compose',
  'bailTop',
  'bailBottom'
]

const getConfig = (loader, key, {
  type,
  optional,
  compose
}) => {
  if (!AVAILABLE_CONFIG_GETTER_TYPES.includes(type)) {
    throw error('INVALID_CONFIG_GETTER_TYPE')
  }

  const config = type === 'compose'
    ? loader.compose({
      key,
      compose
    })

    : loader[type](key)

  if (config === UNDEFINED && !optional) {
    throw error('CONFIG_NOT_OPTIONAL', key)
  }

  return config
}

module.exports = class Binder {
  constructor ({
    cwd,
    dev,
    configLoader,
    applyHooks
  }) {
    this._blocks = null

    this._cwd = cwd
    this._dev = dev
    this._configLoader = configLoader
    this._applyHooks = applyHooks

    this._caviarOptions = {
      cwd: this._cwd,
      dev: this._dev,
      pkg: this._configLoader.pkg
    }
  }

  set blocks (blocks) {
    this._blocks = blocks
  }

  _createBlock ({
    from: Block,
    namespace,
    configMap
  }) {
    const block = new Block()

    // Apply proxied hook taps
    this._applyHooks(Block, block.hooks)

    block[FRIEND_SET_CAVIAR_OPTIONS](this._caviarOptions)

    const configSetting = block[FRIEND_GET_CONFIG_SETTING]()
    const configLoader = namespace
      ? this._configLoader.namespace(namespace)
      : this._configLoader

    if (!configMap) {
      configMap = createConfigMap(configSetting)
    }

    const config = Object.create(null)
    for (const [key, mappedKey] of Object.entries(configMap)) {
      config[key] = getConfig(configLoader, mappedKey, configSetting[key])
    }

    block[FRIEND_SET_CONFIG_VALUE](config)

    // run Block::_create
    block[FRIEND_CREATE]()

    return block
  }

  async ready () {
    const blocksMap = Object.create(null)

    for (const [name, blockSetting] of Object.entries(this._blocks)) {
      blocksMap[name] = this._createBlock(blockSetting)
    }

    await this._orchestrate(blocksMap, this._caviarOptions)

    const blocks = [...Object.values(blocksMap)]
    await Promise.all(blocks.map(block => block.ready()))
  }

  _orchestrate () {
    throw error('NOT_IMPLEMENTED', '_orchestrate')
  }
}
