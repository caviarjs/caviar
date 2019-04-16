const path = require('path')

const fixture = (...args) => path.join(__dirname, ...args)
const create = (configPath, appPath = 'app') => {
  const ConfigLoader = require(fixture(configPath, 'config-loader.js'))

  return new ConfigLoader({
    cwd: fixture(appPath)
  })
}

module.exports = {
  fixture,
  create
}
