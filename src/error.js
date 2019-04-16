const {
  Errors
} = require('err-object')

const {E, error} = new Errors()

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

PREFIX('SANDBOX', 'sandbox', TypeError)
.E('SANDBOX_INVALID_OPTIONS',
  'options must be an object, but got `%s`')

.E('SANDBOX_INVALID_SERVER_PATH',
  'options.serverClassPath must be a string, but got `%s`')

.E('SANDBOX_INVALID_LOADER_PATH',
  'options.serverClassPath must be a string, but got `%s`')

.E('SANDBOX_INVALID_CWD',
  'options.cwd must be a string, but got `%s`')

.E('PRESERVED_ENV_KEY',
  'env key "%s" is preserved by caviar', RangeError)

PREFIX('CONFIG_LOADER', 'config-loader')
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
.E('NOT_READY', 'server.listen() called before the server is ready')

.E('UNEXPECTED_NEXT_WEBPACK',
  '"webpack" is not allowed in caviar.config.next, use caviar.config.webpack instead')

const createError = pre =>
  (code, ...args) => error(`${pre}_${code}`, ...args)

module.exports = {
  error,
  createError
}
