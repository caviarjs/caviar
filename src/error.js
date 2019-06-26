const {
  Errors,
  exitOnNotDefined
} = require('err-object')

const {E, TE, error} = new Errors({
  prefix: '[caviar] ',
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

TE('INVALID_CWD', INVALID_CWD)
TE('INVALID_OPTIONS', INVALID_OPTIONS)
TE('INVALID_PHASE', 'phase must be a string')

TE('INVALID_CONFIG_LOADER_CLASS_PATH', INVALID_CONFIG_LOADER_CLASS_PATH)

E('LOAD_CONFIG_LOADER_FAILS', LOAD_CONFIG_LOADER_FAILS)

// PREFIX('SANDBOX', 'sandbox')

PREFIX('CONFIG_LOADER', 'config-loader')
.E('NOT_LOADED', 'should not load an anchor before config chain is loaded')

.TE('INVALID_NODE_PATH',
  'ConfigLoader::nodePath must be a string')

.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.TE('INVALID_CWD', INVALID_CWD)

.E('PKG_NOT_FOUND', 'package.json not found in directory "%s"')

.E('LOAD_PKG_FAILED', 'fails to load package.json in directory "%s": "%s"')

.E('PATH_GETTER_REQUIRED',
  'getter "path" is required on ConfigLoader.prototype')

.E('PATH_NOT_EXISTS', 'ConfigLoader::path "%s" not exists')

.TE('INVALID_PATH',
  'ConfigLoader::path must be a string')

.TE('INVALID_CONFIG_FILE_NAME',
  'ConfigLoader::configFileName must be a string')

.TE('INVALID_PLUGINS', 'config.caviar.plugins in "%s" must be an array')

// .E('ENV_CONFLICTS',
//   'env key "%s" conflicts in envs and client envs', RangeError)

// .E('PRESERVED_ENV_KEY',
//   'env key "%s" is preserved by caviar', RangeError)

.E('CONFIG_ERRORED', 'fails to load config file "%s", reason:\n%s')

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
