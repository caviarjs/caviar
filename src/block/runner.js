const {
  UNDEFINED,

  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE,
  FRIEND_RUN,

  AVAILABLE_CONFIG_GETTER_TYPES
} = require('../constants')

const error = require('./error')

const createConfigMap = configSetting => {
  const map = Object.create(null)
  for (const key of Object.keys(configSetting)) {
    map[key] = key
  }

  return map
}

const getConfig = (loader, key, {
  type,
  optional,
  compose
}) => {
  if (!AVAILABLE_CONFIG_GETTER_TYPES.includes(type)) {
    throw error('INVALID_CONFIG_GETTER_TYPE', type)
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

// Used by mixer and @caviar/test to run a block
const init = (
  Block,
  caviarOptions,
  hooksManager,
  configLoader,
  configMap
) => {
  const block = new Block()

  // Apply proxied hook taps
  hooksManager.applyHooks(Block, block.hooks)

  block[FRIEND_SET_CAVIAR_OPTIONS](caviarOptions)

  const configSetting = block[FRIEND_GET_CONFIG_SETTING]()

  if (!configMap) {
    configMap = createConfigMap(configSetting)
  }

  const config = Object.create(null)
  for (const [key, mappedKey] of Object.entries(configMap)) {
    config[key] = getConfig(configLoader, mappedKey, configSetting[key])
  }

  block[FRIEND_SET_CONFIG_VALUE](config)

  return block
}

const create = block => block[FRIEND_CREATE]()

const run = block => block[FRIEND_RUN]()

module.exports = {
  init,
  create,
  run
}
