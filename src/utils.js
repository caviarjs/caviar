const path = require('path')

const {
  error
} = require('./error')

const readConfig = configFile => {
  try {
    return require(configFile)
  } catch (err) {
    throw error('CONFIG_ERRORED', configFile, err.stack)
  }
}

// Raw configurations for
// - next
// - webpack
// - env
// - plugins
const getRawConfig = cwd => {
  let configFile

  try {
    configFile = require.resolve(path.join(cwd, 'caviar.config'))
  } catch (err) {
    throw error('CONFIG_NOT_FOUND', cwd)
  }

  return {
    config: readConfig(configFile),
    configFile
  }
}

module.exports = {
  getRawConfig,
  readConfig
}
