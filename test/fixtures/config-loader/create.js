const path = require('path')

const fixture = (...args) => path.join(__dirname, ...args)
const create = (configPath, appPath = 'app') => {
  const ConfigLoader = require(fixture(configPath, 'config-loader.js'))

  return new ConfigLoader({
    cwd: fixture(appPath)
  })
}

const createAndLoad = (...args) => {
  const cl = create(...args)
  cl.load()
  return cl
}

const createAndTestReload = (...args) => {
  const cl = createAndLoad(...args)

  return {
    test (fn) {
      fn(cl)
      cl.reload()
      fn(cl)
    }
  }
}

module.exports = {
  fixture,
  create,
  createAndLoad,
  createAndTestReload
}
