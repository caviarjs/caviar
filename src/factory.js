const {resolve} = require('path')
const {isObject, isString} = require('core-util-is')

const {error} = require('./error')
const createConfigLoader = require('./config/create')

const Caviar = require('./caviar')
const Sandbox = require('./sandbox')
const {IS_CHILD_PROCESS} = require('./constants')

module.exports = rawOptions => {
  if (!isObject(rawOptions)) {
    throw error('INVALID_OPTIONS', rawOptions)
  }

  let {
    cwd,
    dev
  } = rawOptions

  if (!isString(cwd)) {
    throw error('INVALID_CWD', cwd)
  }

  const {
    preset,
    sandbox,
    configFile,

    env,
    stdio,
    [IS_CHILD_PROCESS]: isChildProcess
  } = rawOptions

  if (!configFile && !preset) {
    throw error('OPTION_MISSING')
  }

  if (configFile && !isString(configFile)) {
    throw error('INVALID_CONFIG_FILE', configFile)
  }

  if (preset && !isString(preset)) {
    throw error('INVALID_PRESET', preset)
  }

  cwd = resolve(cwd)
  dev = !!dev

  const configLoader = createConfigLoader({cwd, preset, configFile})

  return sandbox
    ? new Sandbox({
      cwd,
      dev,
      configLoader,

      env,
      stdio,
      preset,
      configFile
    })
    : new Caviar({
      cwd,
      dev,
      configLoader,

      [IS_CHILD_PROCESS]: isChildProcess
    })
}
