const path = require('path')
const {isString, isObject} = require('core-util-is')

const {error} = require('./error')
const {getRawConfig} = require('./utils')

const ESSENTIAL_ENV_KEYS = [
  // For util.debug
  'NODE_DEBUG',
  // For userland debug module
  'DEBUG',
  // For global installed npm packages
  'NODE_PATH',
  // For `child_process.spawn`ers
  'PATH'
]

// Private env keys used by roe,
// which should not be changed by env plugins
const PRIVATE_ENV_KEYS = [
  'CAVIAR_CWD',
  'CAVIAR_DEV'
]

const createInheritEnv = host => key => {
  if (PRIVATE_ENV_KEYS.includes(key)) {
    throw error('PRESERVED_ENV_KEY', key)
  }

  const variable = process.env[key]
  if (variable) {
    host[key] = variable
  }
}

const ensureEnv = host => {
  const inheritEnv = createInheritEnv(host)
  ESSENTIAL_ENV_KEYS.forEach(inheritEnv)
}

// Sanitize and inject new environment variables into
// the child process
class SandboxEnv {
  constructor ({
    cwd,
    dev
  }, rawConfig) {

    this._dev = dev
    this._env = {}
    this.__init()
  }

  _init () {
    Object.assign(this._env, this._clientEnv)
    this._checkAndMerge(this._genericEnv)
  }

  _checkAndMerge (env) {
    Object.keys(env).forEach(key => {
      if (key in this._env) {
        throw error('DUPLICATE_ENV_KEY', key)
      }

      this._env[key] = env[key]
    })
  }

  // ## Usage
  // ```js
  // const env = new Env({
  //   cwd,
  //   env: envConverter
  // })

  // const child = await env.spawn(command, args)
  // child.on('')
  // ```
  spawn (command, args, options = {}) {
    if (!options.stdio) {
      options.stdio = 'inherit'
    }

    options.env = {
      ...this._env,
      CAVIAR_CWD: this._cwd
    }

    if (this._dev) {
      options.env.CAVIAR_DEV = true
    }

    const {
      plugins = []
    } = this._rawConfig

    ensureEnv(options.env)

    const lifecycle = new Lifecycle({
      plugins,
      sandbox: true
    })

    lifecycle.applyPlugins()

    const sandbox = {
      inheritEnv: createInheritEnv(options.env)
    }

    // Apply sandbox env plugins
    lifecycle.hooks.sandboxEnvironment.call(sandbox)

    log('spawn: %s %j', command, args)

    const child = spawn(command, args, options)
    child.on('error', err => {
      log('child process errored: %s', err.stack)
    })

    // TODO
    // handle exit signal
    return child
  }
}

module.exports = class Sandbox {
  constructor (options) {
    if (!isObject(options)) {
      throw error('SANDBOX_INVALID_OPTIONS', options)
    }

    const {
      serverClassPath = path.join(__dirname, 'server.js'),
      configLoaderClassPath = path.join(__dirname, 'config-loader.js'),
      cwd,
      dev,
      port
    } = options

    if (!isString(serverClassPath)) {
      throw error('SANDBOX_INVALID_SERVER_PATH', serverClassPath)
    }

    if (!isString(configLoaderClassPath)) {
      throw error('SANDBOX_INVALID_LOADER_PATH', configLoaderClassPath)
    }

    if (!isString(cwd)) {
      throw error('SANDBOX_INVALID_CWD', cwd)
    }

    this._options = {
      serverClassPath,
      configLoaderClassPath,
      cwd,
      dev,
      port
    }
  }

  async start () {
    const {
      cwd,
      dev
    } = this._options

    const {
      config
    } = getRawConfig(cwd)

    const sandboxEnv = new SandboxEnv({
      cwd,
      dev
    }, config)

    const spawner = path.join(__dirname, '..', 'spawner', 'start.js')
    const command = 'node'

    // TODO: child process events
    await sandboxEnv.spawn(
      command, [
        spawner,
        JSON.stringify(this._options)
      ]
    )
  }
}
