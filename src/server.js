const path = require('path')
const {parse} = require('url')
const EE = require('events')
const log = require('util').debuglog('caviar:lib')

const {isString} = require('core-util-is')
const e2k = require('express-to-koa')
const {serve} = require('egg-serve-static')
const next = require('next')
const roeScriptsWebpack = require('webpack')
const {Roe} = require('roe')
const {code} = require('env-to-code')

const ConfigLoader = require('./config-loader')
const {AppEnv} = require('./env')
const {error} = require('./error')
const {getRawConfig} = require('./utils')
const {Lifecycle} = require('./lifecycle')

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

const createNextMiddleware = nextApp => {
  const handler = nextApp.getRequestHandler()
  const middleware = (req, res) => {
    const {
      [e2k.CONTEXT]: ctx
    } = req

    const {
      params = {},
      url
    } = ctx

    const {
      pathname,
      query
    } = parse(url)

    const parsedUrl = {
      pathname,
      query: {
        ...query,
        ...params
      }
    }

    handler(req, res, parsedUrl)
  }

  return e2k(middleware)
}

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
    this._configFile = undefined
    this._clientEnvKeys = null
    this._nextConfig = null
    this._nextApp = null
    this._serverApp = null
    this._server = null
    this._lifecycle = null
    this._ready = false
  }

  // Getters to override
  // Users can override the getter to specify their own App constructor
  /////////////////////////////////////////////////////////////////////
  get App () {
    return Roe
  }

  get ConfigLoader () {
    return ConfigLoader
  }

  get path () {
    return __dirname
  }
  /////////////////////////////////////////////////////////////////////

  _getAppPkg () {
    this._appPkg = require(path.join(this._cwd, 'package.json'))
  }

  _getRawConfig () {
    ({
      config: this._rawConfig,
      configFile: this._configFile
    } = getRawConfig(this._cwd))
  }

  _initLifecycle () {
    const {
      plugins = []
    } = this._rawConfig

    this._lifecycle = new Lifecycle({
      plugins,
      sandbox: false,
      configFile: this._configFile
    })
    .on('config-reload', config => {
      this._rawConfig = config
    })

    this._lifecycle.applyPlugins()
  }

  // Initialize env
  async _initEnv () {
    const {
      env
    } = this._rawConfig

    if (env && typeof env !== 'function') {
      throw error('INVALID_ENV_CONVERTER', env)
    }

    // Populate new env variable to process.env
    const appEnv = new AppEnv({
      env: env
        ? [env]
        : [],
      cwd: this._cwd
    }, this._rawConfig)

    this._clientEnvKeys = await appEnv.clientEnvKeys()

    const lifecycle = this._lifecycle
    const {environment} = lifecycle.hooks

    // No taps added to environment hook
    if (!environment.isUsed()) {
      return
    }

    lifecycle.clearPlugins()

    await environment.promise()

    lifecycle.reloadConfig()
    lifecycle.applyPlugins()
  }

  // Create real configurations for each component
  _createNextConfig () {
    const {
      next: nextConfig,
      webpack: webpackConfigFactory,

      // We can specify a version of webpack in the config
      webpackModule = roeScriptsWebpack
    } = this._rawConfig


    if (!isString(nextConfig.distDir)) {
      nextConfig.distDir = '.next'
    }

    this._nextConfig = {
      // TODO:
      // loader system to inject default next config
      ...nextConfig(),
      webpack: (nextWebpackConfig, options) => {
        const config = webpackConfigFactory
          ? webpackConfigFactory(
            nextWebpackConfig,
            options,
            // Populate the webpack which caviar uses,
            webpackModule
          )
          // Use default next webpack config
          : nextWebpackConfig

        const definePlugin = createDefinePlugin(
          this._clientEnvKeys,
          webpackModule
        )
        config.plugins.push(definePlugin)

        this._lifecycle.hooks.webpackConfig.call(config, {
          isServer: options.isServer
        })

        return config
      }
    }

    this._lifecycle.hooks.nextConfig.call(this._nextConfig)
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
      conf: this._nextConfig,
      dir: this._cwd
    })

    await app.prepare()
  }

  _createServerApp () {
    log('create server app')

    const baseDir = this._cwd
    const {
      server: serverConfigFactory
    } = this._rawConfig

    const serverConfig = serverConfigFactory
      // TODO:
      // loader system to inject default server config
      ? serverConfigFactory({})
      : {}

    this._lifecycle.hooks.serverConfig.call(serverConfig)

    const {
      plugins,
      ...config
    } = serverConfig

    const app = this._serverApp = new this.App({
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

  _applyNextHandler () {
    if (this._dev) {
      this._applyDevNextHandler()
      return
    }

    this._applyProdNextHandler()
  }

  _applyDevNextHandler () {
    log('apply dev next handler')

    const middleware = createNextMiddleware(this._nextApp)

    // Before this, all routers has been registered,
    // so it is safe to register a middleware which contains no koa `next()`
    this._serverApp.use(middleware)
  }

  _applyProdNextHandler () {
    const app = this._serverApp
    const {
      staticFileMaxAge: maxAge = 0,
      next: {
        distDir
      }
    } = this._rawConfig

    const options = {
      maxAge
    }

    serve(app, '/static', this.resolve('static'), options)
    serve(app, '/_next/static', this.resolve(distDir, 'static'), options)
  }

  resolve (...args) {
    return path.join(this._cwd, ...args)
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
    this._initLifecycle()
    await this._initEnv()
    this._createNextConfig()
    await this._nextBuild()
    await this._createNextApp()
    await this._createServerApp()
    this._createServer()
    this._applyNextHandler()

    this._ready = true
  }

  listen (port) {
    if (!this._ready) {
      throw error('SERVER_NOT_READY')
    }

    port = port || this._port

    this._server.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`server started at http://127.0.0.1:${port}`)
      /* eslint-enable no-console */
    })
  }

  close () {
    this._server.close()
  }
}

module.exports = Server
