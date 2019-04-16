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

const readAndParseEnv = (cwd, filename) => {
  const file = path.join(cwd, filename)
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
    || readAndParseEnv(cwd, GENERIC_ENV_FILENAME)

  config.clientEnvs = config.clientEnvs
    || readAndParseEnv(cwd, CLIENT_ENV_FILENAME)

  return {
    config,
    configFile
  }
}

const inspect = object => util.inspect(object, {
  colors: true,
  depth: 3
})

module.exports = {
  hasOwnProperty,
  getRawConfig,
  inspect
}
