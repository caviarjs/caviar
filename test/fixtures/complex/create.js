const path = require('path')
const assert = require('assert')
const supertest = require('supertest')
const fs = require('fs-extra')
const req = require('request')
const getPort = require('get-port')

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

const createSupertestGet = server => {
  const request = supertest(server.callback())
  return url => request.get(url)
}

const createRequestGet = async server => {
  const port = await getPort()

  /* eslint-disable no-unused-expressions */
  server.server

  await server.listen(port)

  assert(server.port === port, 'port not match')

  return url => new Promise((resolve, reject) => {
    req(`http://127.0.0.1:${port}${url}`, (err, response, body) => {
      if (err) {
        return reject(err)
      }

      const {
        statusCode
      } = response

      resolve({
        text: body,
        statusCode
      })
    })
  })
}

const createRequest = async options => {
  const server = await createAndLoad(options)
  const get = options.mock === false
    ? await createRequestGet(server)
    : createSupertestGet(server)

  return {
    server,
    get
  }
}

const REGIX_MATCH_JS = /href="([^"]+)"/
const testNextResources = async (t, text, get) => {
  const matched = text.match(REGIX_MATCH_JS)

  if (!matched) {
    return
  }

  const js = matched[1]
  const {
    text: jsContent
  } = await get(js)

  t.true(jsContent.includes('webpackJson'), 'should contains webpack')
}

module.exports = {
  fixture,
  root,
  remove,
  create,
  createAndLoad,
  createRequest,
  testNextResources
}
