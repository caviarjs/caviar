const ConfigLoader = require('./loader')

const createConfigLoaderClass = (Super = ConfigLoader, configFile) => configFile
  ? class ExtendedConfigLoader extends Super {
    get configFile () {
      return configFile
    }
  }
  : Super

module.exports = {
  createConfigLoaderClass
}
