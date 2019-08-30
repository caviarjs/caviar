const path = require('path')

const fixture = (...args) => path.join(__dirname, ...args)
const create = configPath => {
  const ConfigLoader = require(fixture(configPath, 'config-loader.js'))

  return new ConfigLoader()
}

const createAndLoad = (...args) => {
  const cl = create(...args)
  cl.load()
  return cl
}

module.exports = {
  fixture,
  create,
  createAndLoad
}
