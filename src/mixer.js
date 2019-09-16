const hasOwnProperty = require('has-own-prop')
const {isString} = require('core-util-is')

const {
  FRIEND_CREATE,
  FRIEND_RUN,
  FRIEND_SET_OPTIONS,
  NAMESPACE_CAVIAR,

  createSymbol
} = require('./constants')
const {
  define,
  getPkg
} = require('./utils')
const {createError} = require('./error')
const initBlock = require('./block/init')

const BLOCKS = createSymbol('blocks')
const CONFIG_LOADER = createSymbol('config-loader')
const HOOKS_MANAGER = createSymbol('hooks-manager')
const CAVIAR_OPTIONS = createSymbol('caviar-options')

const INIT_BLOCK = createSymbol('init-block')

const error = createError('MIXER')

// Returns `false|string`
const getPhase = (blockPhase, phaseMap = {}, name) => {
  const phase = hasOwnProperty(phaseMap, blockPhase)
    // Explicitly defined
    // - map a phase to `false` to disable the block
    // - map a user phase to a certain phase of the block
    ? phaseMap[blockPhase]

    // Not mapped
    : blockPhase

  if (phase !== false && !isString(phase)) {
    throw error('INVALID_PHASE', name, phase)
  }

  return phase
}

module.exports = class Mixer {
  [FRIEND_SET_OPTIONS] ({
    cwd,
    dev,
    configLoader,
    hooksManager
  }) {
    define(this, CONFIG_LOADER, configLoader)
    define(this, HOOKS_MANAGER, hooksManager)

    const pkg = getPkg(cwd)

    // Freeze the object, so that it could not be modified by blocks or mixers
    define(this, CAVIAR_OPTIONS, Object.freeze({
      cwd,
      dev,
      pkg
    }))
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
  //       // key: the phase name used by the Mixer
  //       // value: the corresponding phase name of the block
  //       build: 'build'
  //     }
  //   }
  // }
  set blocks (blocks) {
    define(this, BLOCKS, blocks)
  }

  [INIT_BLOCK] ({
    from: Block,
    namespace,
    configMap,
    phaseMap
  }, blockPhase, name) {
    const phase = getPhase(blockPhase, phaseMap, name)

    if (namespace === NAMESPACE_CAVIAR) {
      throw error('RESERVED_NAMESPACE', namespace)
    }

    const configLoader = namespace
      ? this[CONFIG_LOADER].namespace(namespace)
      : this[CONFIG_LOADER]

    return initBlock(
      Block,
      {
        ...this[CAVIAR_OPTIONS],
        phase
      },
      this[HOOKS_MANAGER],
      configLoader,
      configMap
    )
  }

  async [FRIEND_RUN] (phase) {
    const blocksMap = Object.create(null)

    for (const [name, setting] of Object.entries(this[BLOCKS])) {
      blocksMap[name] = this[INIT_BLOCK](setting, phase, name)
    }

    // The `mixPromise` might depend on hooks invocations created by
    // - block[FRIEND_CREATE]()
    // - block[FRIEND_RUN]()
    // so, DO NOT `await mixPromise` here
    const mixPromise = this.mix(blocksMap, {
      ...this[CAVIAR_OPTIONS],
      phase
    })

    const blocks = Object.values(blocksMap)
    for (const block of blocks) {
      block[FRIEND_CREATE]()
    }

    // We iterate `blocks` again
    // to make sure each `hooks.created` has been executed
    const tasks = [mixPromise]

    for (const block of blocks) {
      tasks.push(block[FRIEND_RUN]())
    }

    await Promise.all(tasks)
  }

  mix () {
    throw error('NOT_IMPLEMENTED', 'mix')
  }
}
