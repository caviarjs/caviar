const SYMBOL_PREFIX = 'caviar'
const createSymbol = name =>
  Symbol(`${SYMBOL_PREFIX}:${name}`)

const FRIEND_GET_CONFIG_SETTING = createSymbol('get-config-setting')
const FRIEND_SET_CONFIG_VALUE = createSymbol('set-config-value')
const FRIEND_SET_CAVIAR_OPTIONS = createSymbol('set-caviar-opts')

const FRIEND_CREATE = createSymbol('create')
const FRIEND_RUN = createSymbol('run')

const FRIEND_SET_OPTIONS = createSymbol('set-options')

const IS_CHILD_PROCESS = createSymbol('is-child-process')
const IS_SANDBOX = createSymbol('is-sandbox')

const FRIEND_SET_RESERVED_HOOKS_FACTORY =
  createSymbol('reserved-hooks-factory')

const CAVIAR_MESSAGE_COMPLETE = 'caviar:child:complete'

const MODULE_NOT_FOUND = 'MODULE_NOT_FOUND'

const SANDBOX_OUTER = 'outer'
const SANDBOX_INNER = 'inner'

const AVAILABLE_CONFIG_GETTER_TYPES = [
  'compose',
  'bailTop',
  'bailBottom'
]

const NOOP = () => {}

module.exports = {
  // UNDEFINED: undefined,

  RETURN_TRUE: () => true,

  PHASE_DEFAULT: 'default',

  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,

  FRIEND_CREATE,
  FRIEND_RUN,
  FRIEND_SET_OPTIONS,

  IS_CHILD_PROCESS,
  IS_SANDBOX,

  CAVIAR_MESSAGE_COMPLETE,

  FRIEND_SET_RESERVED_HOOKS_FACTORY,

  MODULE_NOT_FOUND,

  NOOP,

  SANDBOX_OUTER,
  SANDBOX_INNER,

  AVAILABLE_CONFIG_GETTER_TYPES,

  createSymbol
}
