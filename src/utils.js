const path = require('path')
const util = require('util')
const {isString, isArray} = require('core-util-is')
const resolveFrom = require('resolve-from')

const {error} = require('./error')
const {MODULE_NOT_FOUND} = require('./constants')

const readConfig = configFile => {
  try {
    return require(configFile)
  } catch (err) {
    if (err.code === MODULE_NOT_FOUND) {
      throw error('CONFIG_LOADER_CONFIG_FILE_NOT_FOUND', configFile)
    }

    throw error('CONFIG_LOADER_CONFIG_ERRORED', configFile, err.stack)
  }
}

// Raw configurations of a config layer
const getRawConfig = configFile => {
  const config = readConfig(configFile)

  const caviar = config.caviar || (config.caviar = {})

  // config.caviar.envs
  caviar.envs = caviar.envs || {}

  return {
    config,
    configFile
  }
}

const inspect = object => util.inspect(object, {
  colors: true,
  depth: 3
})

const requireModule = name => {
  const module = require(name)
  return module.default || module
}

const requirePreset = (from, preset) => {
  if (!preset) {
    return
  }

  let resolved

  try {
    resolved = resolveFrom(from, preset)
  } catch (err) {
    throw error('PRESET_NOT_FOUND', preset, err.stack)
  }

  try {
    return requireModule(resolved)
  } catch (err) {
    throw error('LOAD_PRESET_FAILS', preset, err.stack)
  }
}

const joinEnvPaths = (base, ...paths) => {
  const {delimiter} = path

  if (base) {
    paths = paths
    .concat(
      base
      .split(delimiter)
      .filter(Boolean)
    )
  }

  return paths.join(delimiter)
}

const isSubClass = (Class, ParentClass) =>
  Class.prototype instanceof ParentClass

const isStringArray = array =>
  isArray(array) && array.every(isString)

const define = (host, key, value, writable = false) =>
  Object.defineProperty(host, key, {
    value,
    writable
  })

const defineWritable = (host, key, value) => define(host, key, value, true)

const defineGetter = (host, key, get) => define(host, key, {get})

const getPkg = cwd => {
  const packageFilepath = path.join(cwd, 'package.json')

  try {
    return require(packageFilepath)
  } catch (err) {
    if (err.code === MODULE_NOT_FOUND) {
      throw error('PKG_NOT_FOUND', cwd)
    }

    throw error('LOAD_PKG_FAILED', cwd, err.stack)
  }
}

const once = (...fns) => {
  let called = false

  const ret = []
  const wrap = fn => (...args) => {
    if (!called) {
      called = true
      fn(...args)
    }
  }

  for (const fn of fns) {
    ret.push(wrap(fn))
  }

  return ret
}

module.exports = {
  getRawConfig,
  inspect,
  requireModule,
  requirePreset,
  joinEnvPaths,
  isSubClass,
  isStringArray,
  define,
  defineWritable,
  defineGetter,
  getPkg,
  once
}
