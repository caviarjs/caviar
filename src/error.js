const {
  Errors,
  exitOnNotDefined
} = require('err-object')

const {E, error} = new Errors({
  notDefined: exitOnNotDefined
})

const STRING_BUT_GOT = ', but got `%s`'
class Prefixer {
  constructor (codePrefix, messagePrefix) {
    this._codePrefix = codePrefix
    this._messagePrefix = messagePrefix
  }

  E (code, message, Ctor) {
    E(
      `${this._codePrefix}_${code}`,
      `[caviar:${this._messagePrefix}] ${message}`,
      Ctor
    )

    return this
  }

  TE (code, message) {
    return this.E(code, message + STRING_BUT_GOT, TypeError)
  }
}

const PREFIX = (...args) => new Prefixer(...args)

const INVALID_OPTIONS = 'options must be an object'
const INVALID_CWD = 'options.cwd must be a string'
const INVALID_CONFIG_LOADER_CLASS_PATH = 'options.configLoaderClassPath must be a string'
const LOAD_CONFIG_LOADER_FAILS = 'fails to load class ConfigLoader, reason:\n%s'

PREFIX('SANDBOX', 'sandbox')
.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.TE('INVALID_SERVER_CLASS_PATH',
  'options.serverClassPath must be a string')

.TE('INVALID_CONFIG_LOADER_CLASS_PATH', INVALID_CONFIG_LOADER_CLASS_PATH)

.E('LOAD_CONFIG_LOADER_FAILS', LOAD_CONFIG_LOADER_FAILS)

.TE('INVALID_CWD', INVALID_CWD)

.E('PRESERVED_ENV_KEY',
  'env key "%s" is preserved by caviar', RangeError)

PREFIX('CONFIG_LOADER', 'config-loader')
.E('NOT_LOADED', 'should not load an anchor before config chain is loaded')

.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.TE('INVALID_CWD', INVALID_CWD)

.E('PATH_GETTER_REQUIRED',
  'getter "path" is required on ConfigLoader.prototype')

.E('PATH_NOT_EXISTS', 'ConfigLoader::path "%s" not exists')

.TE('INVALID_PATH',
  'ConfigLoader::path must be a string')

.TE('INVALID_CONFIG_FILE_NAME',
  'ConfigLoader::configFileName must be a string')

.TE('INVALID_NODE_PATH',
  'ConfigLoader::nodePath must be a string')

.TE('INVALID_CONFIG_ANCHOR',
  'caviar.config.%s in "%s" must be a function')

.E('INVALID_RETURN_VALUE',
  'caviar.config.%s in "%s" must return an object', TypeError)

.E('INVALID_NEXT_RETURN_VALUE',
  'caviar.config.next in "%s" must return a function by using the first argument `withPlugins`', TypeError)

.E('NEXT_CONFIG_NOT_FOUND', 'no caviar.config.next is found')

.E('ENV_CONFLICTS',
  'env key "%s" conflicts in envs and client envs', RangeError)

.E('CONFIG_ERRORED', 'fails to load config file "%s", reason:\n%s')

PREFIX('SERVER', 'server')
.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.TE('INVALID_CWD', INVALID_CWD)

.E('NOT_READY', 'server.listen() called before the server is ready')

.TE('INVALID_CONFIG_LOADER_CLASS_PATH', INVALID_CONFIG_LOADER_CLASS_PATH)

.E('LOAD_CONFIG_LOADER_FAILS', LOAD_CONFIG_LOADER_FAILS)

.TE('INVALID_PORT', 'port must be a number')

PREFIX('CHILD_PROCESS', 'child-process')
.E('ERRORED', 'child process encountered an error, reason:\n%s')

.E('KILLED', 'child process is killed by signal "%s"')

.E('NONE_ZERO_EXIT_CODE', 'child process closed with non-zero code %s')

.E('UNEXPECTED_CLOSE', 'child process closed unexpectedly')

const createError = pre =>
  (code, ...args) => error(`${pre}_${code}`, ...args)

module.exports = {
  error,
  createError
}
