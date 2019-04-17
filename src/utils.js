const path = require('path')
const fs = require('fs')
const util = require('util')
const log = require('util').debuglog('caviar')
const {parse} = require('dotenv')

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

const readConfig = configFile => {
  try {
    return require(configFile)
  } catch (err) {
    throw error('CONFIG_LOADER_CONFIG_ERRORED', configFile, err.stack)
  }
}

const CLIENT_ENV_FILENAME = 'client.env'
const GENERIC_ENV_FILENAME = '.env'

// Raw configurations for
// - next
// - webpack
// - env
// - plugins
const getRawConfig = (cwd, configFileName) => {
  let configFile

  try {
    configFile = require.resolve(path.join(cwd, configFileName))
  } catch (err) {
    log('config file "%s" not found', configFile)
    return
  }

  const config = readConfig(configFile)

  config.envs = config.envs
    || readAndParseEnv(cwd, configFileName, GENERIC_ENV_FILENAME)

  config.clientEnvs = config.clientEnvs
    || readAndParseEnv(cwd, configFileName, CLIENT_ENV_FILENAME)

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

const createAddBuiltinModule = webpackConfig => {
  const {
    resolve: {
      alias
    }
  } = webpackConfig

  return (name, resolved, exact) => {
    const aliasName = exact
      ? `${name}$`
      : name
    alias[aliasName] = resolved
  }
}

const NODE_MODULES = path.join(__dirname, '..', 'node_modules')
const DELIMITER = '/'

// By default, `next/babel`, ie the default babel preset of next,
// requires these modules

// A collection package is the package that we will require by
// ```js
// require('package-name/some-module')
// ```
const BUILTIN_COLLECTION_PACKAGES = [
  '@babel/runtime-corejs2'
]

const BUILTIN_PACKAGES = [
  'react-dom'
]

const getPackageRoot = name =>
  path.join(NODE_MODULES, ...name.split(DELIMITER))

const addResolveAliases = webpackConfig => {
  const addBuiltinModule = createAddBuiltinModule(webpackConfig)

  BUILTIN_COLLECTION_PACKAGES.forEach(name => {
    addBuiltinModule(name, getPackageRoot(name))
  })

  BUILTIN_PACKAGES.forEach(name => {
    addBuiltinModule(name, require.resolve(name), true)
  })
}

module.exports = {
  hasOwnProperty,
  getRawConfig,
  inspect,
  requireModule,
  createAddBuiltinModule,
  addResolveAliases
}
