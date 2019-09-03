const {
  Errors
} = require('err-object')

const {E, error} = new Errors({
  filterStackSources: [
    __filename
  ]
})

const STRING_BUT_GOT = ', but got `%s`'
class Prefixer {
  constructor (codePrefix, messagePrefix) {
    this._codePrefix = codePrefix
    this._messagePrefix = messagePrefix
  }

  E (code, message, Ctor) {
    const codePrefix = this._codePrefix
      ? `${this._codePrefix}_`
      : ''

    const messagePrefix = this._messagePrefix
      ? `[caviar:${this._messagePrefix}] `
      : '[caviar] '

    E(
      codePrefix + code,
      messagePrefix + message,
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

PREFIX()
.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.TE('INVALID_CWD', 'options.cwd must be a string')

.E('OPTION_MISSING',
  'options.preset and options.configFile are both unspecified')

.TE('INVALID_CONFIG_FILE',
  'options.configFile should either be falsy or a path string')

.TE('INVALID_PRESET', 'options.preset should either be falsy or a string')

.TE('INVALID_PHASE', 'phase must be a string')

.E('PRESET_NOT_FOUND', 'preset "%s" not found, reason:\n%s')

.E('LOAD_PRESET_FAILS', 'fails to load preset "%s", reason:\n%s')

PREFIX('BLOCK', 'block')
.TE('INVALID_PHASES', 'phases must be array of strings')

.E('NOT_IMPLEMENTED', 'method "%s" must be implemented')

PREFIX('MIXER', 'mixer')
.TE('INVALID_PHASE',
  'mapped phase in phaseMap should be a string or false for block "%s"')

.E('PKG_NOT_FOUND', 'package.json not found in directory "%s"')

.E('LOAD_PKG_FAILED', 'fails to load package.json in directory "%s": "%s"')

PREFIX('CONFIG_LOADER', 'config-loader')
.TE('INVALID_NODE_PATH',
  'ConfigLoader::nodePath must be a string')

.TE('INVALID_OPTIONS', INVALID_OPTIONS)

.E('CONFIG_FILE_GETTER_REQUIRED',
  'getter "configFile" is required on ConfigLoader.prototype')

.E('PATH_NOT_ABSOLUTE', '%s must be an absolute path, but got "%s"', RangeError)

.E('PATH_NOT_FOUND', '%s "%s" not found, reason:\n%s')

.TE('INVALID_CONFIG_FILE',
  'ConfigLoader::configFile must be a string')

.TE('INVALID_PLUGINS', 'config.caviar.plugins in "%s" must be an array')

.E('ERR_LOAD_CONFIG_FILE', 'fails to load config file "%s", reason:\n%s')

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
