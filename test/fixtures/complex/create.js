const path = require('path')
const supertest = require('supertest')
const fs = require('fs-extra')

const Server = require('../../../src/server')

const PATH_CONFIG_LOADER = require.resolve('../../../src/config-loader')

const fixture = (...args) =>
  path.join(__dirname, ...args)

const root = (...args) =>
  path.join(__dirname, '..', '..', '..', ...args)

const create = ({
  name,
  configLoaderClassPath = PATH_CONFIG_LOADER,
  dev = true
}) => new Server({
  cwd: fixture(name),
  dev,
  configLoaderClassPath
})

const NOOP = () => {}
const remove = name => fs.remove(name).catch(NOOP)

const createAndLoad = async options => {
  const {
    name
  } = options

  // Remove next cache dir
  await remove(fixture(name, '.next'))

  const type = process.env.CAVIAR_APP_TYPE

  if (type) {
    options.name = `${options.name}-${type}`
    await remove(fixture(options.name))

    // Copy to new dir,
    // so that next instances will not fuck with each other
    await fs.copy(fixture(name), fixture(options.name))
  }

  const server = create(options)
  await server.ready()
  return server
}

const createRequest = async options => {
  const server = await createAndLoad(options)
  return {
    server,
    request: supertest(server.callback())
  }
}

const removeWebpackDllCache = () =>
  remove(root('node_modules', '.cache'))

module.exports = {
  fixture,
  root,
  remove,
  create,
  createAndLoad,
  createRequest,
  removeWebpackDllCache
}
