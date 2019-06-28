const SYMBOL_PREFIX = 'caviar:'
const createSymbol = name =>
  Symbol(`${SYMBOL_PREFIX}:${name}`)

const FRIEND_GET_CONFIG_SETTING = createSymbol('get-config-setting')
const FRIEND_SET_CONFIG_VALUE = createSymbol('set-config-value')
const FRIEND_SET_CAVIAR_OPTIONS = createSymbol('set-caviar-opts')
const FRIEND_CREATE = createSymbol('create')
const FRIEND_RUN = createSymbol('run')

const FRIEND_SET_RESERVED_HOOKS_FACTORY =
  createSymbol('reserved-hooks-factory')

module.exports = {
  // UNDEFINED: undefined,

  RETURNS_TRUE: () => true,
  IS_SANDBOX_PLUGIN: ({sandbox}) => sandbox === true,
  IS_NOT_SANDBOX_PLUGIN: ({sandbox}) => sandbox !== true,
  PHASE_DEFAULT: 'default',

  FRIEND_GET_CONFIG_SETTING,
  FRIEND_SET_CONFIG_VALUE,
  FRIEND_SET_CAVIAR_OPTIONS,
  FRIEND_CREATE,
  FRIEND_RUN,

  FRIEND_SET_RESERVED_HOOKS_FACTORY,

  createSymbol
}
