const path = require('path')
const supertest = require('supertest')

const Server = require('../../../src/server')

const PATH_CONFIG_LOADER = require.resolve('../../../src/config-loader')

const fixture = (...args) =>
  path.join(__dirname, ...args)

const create = (
  name,
  configLoaderClassPath = PATH_CONFIG_LOADER
) => new Server({
  cwd: fixture(name),
  dev: true,
  configLoaderClassPath
})

const createAndLoad = async (...args) => {
  const server = create(...args)
  await server.ready()
  return {
    server,
    request: supertest(server.callback())
  }
}

module.exports = {
  fixture,
  create,
  createAndLoad
}
