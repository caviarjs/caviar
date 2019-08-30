const path = require('path')
const fs = require('fs')
const util = require('util')
const log = require('util').debuglog('caviar')
const {parse} = require('dotenv')
const {isString, isArray} = require('core-util-is')

const {error} = require('./error')

const exists = file => {
  try {
    fs.accessSync(file, fs.constants.R_OK)
    return true
  } catch (_) {
    return false
  }
}

const readFile = file => {
  try {
    const content = fs.readFileSync(file)
    return content.toString()
  } catch (err) {
    // do nothing
  }
}

const readAndParseEnv = (...args) => {
  const file = path.join(...args)
  const existed = exists(file)
  if (!existed) {
    return
  }

  const content = readFile(file)
  return parse(content)
}

const readConfig = configFilepath => {
  try {
    return require(configFilepath)
  } catch (err) {
    throw error('CONFIG_LOADER_CONFIG_ERRORED', configFilepath, err.stack)
  }
}

const GENERIC_ENV_FILENAME = '.env'

// Raw configurations of a config layer
const getRawConfig = (cwd, configFileName) => {
  let configFilepath

  try {
    configFilepath = require.resolve(path.join(cwd, configFileName))
  } catch (err) {
    log('config file "%s" not found', configFilepath)
    return
  }

  const config = readConfig(configFilepath)
  const caviar = config.caviar || (config.caviar = {})

  // config.caviar.envs
  caviar.envs = caviar.envs || {}

  // .env file inside `ConfigLoader::configFileName`
  caviar.dotenvs = readAndParseEnv(cwd, configFileName, GENERIC_ENV_FILENAME)

  return {
    config,
    configFilepath
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

const requireConfigLoader = configLoaderClassPath => {
  if (!isString(configLoaderClassPath)) {
    throw error('INVALID_CONFIG_LOADER_CLASS_PATH',
      configLoaderClassPath)
  }

  try {
    return requireModule(configLoaderClassPath)
  } catch (err) {
    throw error('LOAD_CONFIG_LOADER_FAILS', err.stack)
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

// const mixin = (Class, mixins) => {
//   const {prototype} = Class

//   for (const property of Object.keys(mixins)) {
//     const descriptor = Reflect.getOwnPropertyDescriptor(mixins, property)
//     Object.defineProperty(prototype, {
//       ...descriptor,
//       configurable: false,
//       writable: false,
//       enumerable: false
//     })
//   }
// }

const isStringArray = array =>
  isArray(array) && array.every(isString)

const define = (host, key, value, writable = false) =>
  Object.defineProperty(host, key, {
    value,
    writable
  })

const defineWritable = (host, key, value) => define(host, key, value, true)

const getPkg = cwd => {
  const packageFilepath = path.join(cwd, 'package.json')

  try {
    return require(packageFilepath)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw error('PKG_NOT_FOUND', cwd)
    }

    throw error('LOAD_PKG_FAILED', cwd, err.stack)
  }
}

module.exports = {
  getRawConfig,
  inspect,
  requireModule,
  requireConfigLoader,
  joinEnvPaths,
  isSubClass,
  isStringArray,
  define,
  defineWritable,
  getPkg
  // mixin
}
