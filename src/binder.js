const {
  UNDEFINED,
  PHASE_DEFAULT,

  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE,
  FRIEND_RUN,

  createSymbol
} = require('./constants')

const {createError} = require('./error')

const INIT_BLOCK = createSymbol('init-block')
const BLOCKS = createSymbol('blocks')
const CONFIG_LOADER = createSymbol('config-loader')
const HOOKS_MANAGER = createSymbol('hooks-manager')
const CAVIAR_OPTIONS = createSymbol('caviar-options')

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

const getPhase = (blockPhase, phaseMap = {}) => {
  let phase = phaseMap[blockPhase]
  if (!phase && blockPhase === PHASE_DEFAULT) {
    phase = PHASE_DEFAULT
  }

  return phase
}

module.exports = class Binder {
  constructor ({
    cwd,
    dev,
    configLoader,
    hooksManager
  }) {
    this[BLOCKS] = null

    this[CONFIG_LOADER] = configLoader
    this[HOOKS_MANAGER] = hooksManager

    this[CAVIAR_OPTIONS] = {
      cwd,
      dev,
      pkg: this[CONFIG_LOADER].pkg
    }
  }

  // - blocks `{string: BlockSetting}`

  // Usage:
  // this.blocks = {
  //   next: {
  //     // required
  //     from: NextBlock,
  //     // required
  //     // Use default configMap
  //     configMap: {
  //       // key: the config name of NextBlock
  //       // value: the config anchor name of the config chain
  //       next: 'next'
  //       nextWebpack: 'nextWebpack'
  //     },
  //     // @required
  //     phaseMap: {
  //       // key: the phase name used by the Binder
  //       // value: the corresponding phase name of the block
  //       build: 'build'
  //     }
  //   }
  // }
  set blocks (blocks) {
    this[BLOCKS] = blocks
  }

  [INIT_BLOCK] ({
    from: Block,
    namespace,
    configMap,
    phaseMap
  }, blockPhase) {
    const block = new Block()

    // Apply proxied hook taps
    this[HOOKS_MANAGER].applyHooks(Block, block.hooks)

    const phase = getPhase(blockPhase, phaseMap)

    block[FRIEND_SET_CAVIAR_OPTIONS]({
      ...this[CAVIAR_OPTIONS],
      phase
    })

    const configSetting = block[FRIEND_GET_CONFIG_SETTING]()
    const configLoader = namespace
      ? this[CONFIG_LOADER].namespace(namespace)
      : this[CONFIG_LOADER]

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

  async [FRIEND_RUN] (phase) {
    const blocksMap = Object.create(null)

    for (const [name, setting] of Object.entries(this[BLOCKS])) {
      blocksMap[name] = this[INIT_BLOCK](setting, phase)
    }

    await this.orchestrate(blocksMap, {
      ...this[CAVIAR_OPTIONS],
      phase
    })

    const blocks = Object.values(blocksMap)
    for (const {block} of blocks) {
      block[FRIEND_CREATE]()
    }

    // We iterate `blocks` again
    // to make sure each `hooks.created` has been executed
    const tasks = []
    for (const block of blocks) {
      tasks.push(block[FRIEND_RUN]())
    }

    await Promise.all(tasks)
  }

  orchestrate () {
    throw error('NOT_IMPLEMENTED', '_orchestrate')
  }
}
