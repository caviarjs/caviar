const ConfigLoader = require('./loader')
const {requirePreset} = require('../utils')

const createConfigLoaderClass = (Super = ConfigLoader, configFile) => configFile
  ? class ExtendedConfigLoader extends Super {
    get configFile () {
      return configFile
    }
  }
  : Super

// @private
const createConfigLoader = ({
  cwd,
  preset,
  configFile
}) => {
  const PresetClass = requirePreset(cwd, preset)
  const Extended = createConfigLoaderClass(PresetClass, configFile)

  return new Extended()
}

module.exports = createConfigLoader
