const {
  Errors,
  exitOnNotDefined
} = require('err-object')

const {E, error} = new Errors({
  notDefined: exitOnNotDefined
})

class Prefixer {
  constructor (codePrefix, messagePrefix, ctor = Error) {
    this._codePrefix = codePrefix
    this._messagePrefix = messagePrefix
    this._ctor = ctor
  }

  E (code, message, Ctor) {
    E(
      `${this._codePrefix}_${code}`,
      `[caviar:${this._messagePrefix}] ${message}`,
      Ctor || this._ctor
    )

    return this
  }
}

const PREFIX = (...args) => new Prefixer(...args)

const INVALID_OPTIONS = 'options must be an object, but got `%s`'
const INVALID_CWD = 'options.cwd must be a string, but got `%s`'
const INVALID_CONFIG_LOADER_CLASS_PATH = 'options.configLoaderClassPath must be a string, but got `%s`'
const LOAD_CONFIG_LOADER_FAILS = 'fails to load class ConfigLoader, reason:\n%s'

PREFIX('SANDBOX', 'sandbox', TypeError)
.E('INVALID_OPTIONS', INVALID_OPTIONS)

.E('INVALID_SERVER_CLASS_PATH',
  'options.serverClassPath must be a string, but got `%s`')

.E('INVALID_CONFIG_LOADER_CLASS_PATH', INVALID_CONFIG_LOADER_CLASS_PATH)

.E('LOAD_CONFIG_LOADER_FAILS', LOAD_CONFIG_LOADER_FAILS)

.E('INVALID_CWD', INVALID_CWD)

.E('PRESERVED_ENV_KEY',
  'env key "%s" is preserved by caviar', RangeError)

PREFIX('CONFIG_LOADER', 'config-loader')
.E('INVALID_OPTIONS', INVALID_OPTIONS, TypeError)

.E('INVALID_CWD', INVALID_CWD, TypeError)

.E('PATH_GETTER_REQUIRED',
  'getter "path" is required on ConfigLoader.prototype')

.E('PATH_NOT_EXISTS', 'ConfigLoader::path "%s" not exists')

.E('INVALID_PATH',
  'ConfigLoader::path must be a string, but got `%s`', TypeError)

.E('INVALID_CONFIG_FILE_NAME',
  'ConfigLoader::configFileName must be a string, but got `%s`',
  TypeError)

.E('INVALID_CONFIG_FIELD',
  'caviar.config.%s in "%s" must be a function, but got `%s`', TypeError)

.E('INVALID_RETURN_VALUE',
  'caviar.config.%s in "%s" must return an object', TypeError)

.E('INVALID_NEXT_RETURN_VALUE',
  'caviar.config.next in "%s" must return a function by using the first argument `withPlugins`', TypeError)

.E('NEXT_CONFIG_NOT_FOUND', 'no caviar.config.next is found')

.E('ENV_CONFLICTS',
  'env key "%s" conflicts in envs and client envs', RangeError)

.E('CONFIG_ERRORED', 'fails to load config file "%s", reason:\n%s')

PREFIX('SERVER', 'server')
.E('INVALID_OPTIONS', INVALID_OPTIONS, TypeError)

.E('INVALID_CWD', INVALID_CWD, TypeError)

.E('NOT_READY', 'server.listen() called before the server is ready')

.E('INVALID_CONFIG_LOADER_CLASS_PATH',
  INVALID_CONFIG_LOADER_CLASS_PATH, TypeError)

.E('LOAD_CONFIG_LOADER_FAILS', LOAD_CONFIG_LOADER_FAILS)

.E('INVALID_PORT', 'port must be a number, but got `%s`', TypeError)

const createError = pre =>
  (code, ...args) => error(`${pre}_${code}`, ...args)

module.exports = {
  error,
  createError
}
