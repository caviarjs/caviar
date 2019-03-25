const path = require('path')
const EE = require('events')
const log = require('util').debuglog('roe-scripts:lib')

const next = require('next')
const roeScriptsWebpack = require('webpack')
const {
  Roe
} = require('roe')

const {code} = require('env-to-code')
const {AppEnv} = require('./env')

const createDefinePlugin = (envKeys, wp) => {
  const {DefinePlugin} = wp
  const {runtimeValue} = DefinePlugin

  const config = {}
  envKeys.forEach(key => {
    // Uses `webpack.DefinePlugin.runtimeValue`,
    // so that the changes of process.env could take effect at runtime
    config[`process.env.${key}`] = runtimeValue(
      () => code(process.env[key])
    )
  })

  return new DefinePlugin(config)
}

const isPlainObject = object => Object.keys(object).length === 0


class Server extends EE {
  constructor ({
    cwd,
    port,
    dev
  }) {
    super()

    this._cwd = cwd
    this._port = port
    this._dev = dev

    this._appPkg = null
    this._rawConfig = null
    this._clientEnvKeys = null
    this._nextConfig = null
    this._nextApp = null
    this._serverApp = null
    this._server = null
  }

  _getAppPkg () {
    this._appPkg = require(path.join(this._cwd, 'package.json'))
  }

  // Raw configurations for
  // - next
  // - webpack
  // - env
  // - plugins (TODO)
  _getRawConfig () {
    this._rawConfig = require(path.join(this._cwd, 'roe.config'))
  }

  // Initialize env
  async _initEnv () {
    const {
      env
    } = this._rawConfig

    // Populate new env variable to process.env
    const appEnv = new AppEnv({
      env: [env],
      cwd: this._cwd
    })

    this._clientEnvKeys = await appEnv.clientEnvKeys()
  }

  // Create real configurations for each component
  _createNextConfig () {
    const {
      next: nextConfig,
      webpack: webpackConfigFactory,

      // We can specify a version of webpack in the config
      webpackModule = roeScriptsWebpack
    } = this._rawConfig

    this._nextConfig = {
      ...nextConfig,
      webpack: (nextWebpackConfig, options) => {
        const config = webpackConfigFactory
          ? webpackConfigFactory(
            nextWebpackConfig,
            options,
            // Populate the webpack which roe-scripts uses,
            webpackModule
          )
          // Use default next webpack config
          : nextWebpackConfig

        const definePlugin = createDefinePlugin(
          this._clientEnvKeys,
          webpackModule
        )
        config.plugins.push(definePlugin)

        return config
      }
    }
  }

  async _nextBuild () {
    if (this._dev) {
      return
    }

    await require('next/dist/build').default(this._cwd, this._nextConfig)
  }

  async _createNextApp () {
    log('create next app')

    const app = this._nextApp = next({
      // TODO
      dev: this._dev,
      conf: this._nextConfig
    })

    await app.prepare()
  }

  _createServerApp () {
    log('create server app')

    const baseDir = this._cwd
    const {
      server: serverConfig
    } = this._rawConfig

    // TODO:
    // Migrate to roe
    const {
      plugins,
      ...config
    } = serverConfig || {}

    const app = this._serverApp = new Roe({
      // framework,
      baseDir,
      plugins,
      https: false,
      title: this._appPkg.name,
      type: 'application',
      extends: {
        next: this._nextApp
      },
      config: isPlainObject(config)
        ? null
        : config
    })

    return new Promise((resolve, reject) => {
      app.ready(err => {
        if (err) {
          reject(err)
          return
        }

        log('server app got ready')
        resolve()
      })
    })
  }

  _createServer () {
    log('create server app')

    this._server = require('http').createServer(this._serverApp.callback())

    const server = this._server
    server.on('error', err => {
      this.emit('error', err)
    })

    this._serverApp.emit('server', server)
  }

  get next () {
    return this._nextApp
  }

  get app () {
    return this._serverApp
  }

  get server () {
    return this._server
  }

  async ready () {
    this._getAppPkg()
    this._getRawConfig()
    await this._initEnv()
    this._createNextConfig()
    await this._nextBuild()
    await this._createNextApp()
    await this._createServerApp()
    this._createServer()
  }

  listen (port) {
    this._server.listen(port || this._port, () => {
      /* eslint-disable no-console */
      console.log(`server started at http://127.0.0.1:${this._port}`)
      /* eslint-enable no-console */
    })
  }

  async start () {
    try {
      await this.ready()
    } catch (err) {
      log('fails to start, reason: %s', err.stack)
      process.exit(1)
    }

    this.listen()
  }
}

module.exports = Server
