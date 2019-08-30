const createConfigLoaderClass = (Super, configFile) =>
  class ConfigLoader extends Super {
    get configFile () {
      return configFile
    }
  }

module.exports = {
  createConfigLoaderClass
}
