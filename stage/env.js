const path = require('path')
const log = require('util').debuglog('caviar:lib')
const {
  setup,
  awaitReady,
  SET_READY,
  SET_ERROR
} = require('after-ready')
const spawn = require('cross-spawn')
const {
  waterfall
} = require('promise.extra')

const {error} = require('../src/error')
const {Lifecycle} = require('../src/lifecycle')

// Ref
// https://github.com/tc39/proposal-decorators/blob/7fa580b40f2c19c561511ea2c978e307ae689a1b/METAPROGRAMMING.md

// Used for spawner
@setup
class BaseEnv {
  constructor (cwd, rawConfig) {
    this._cwd = cwd
    this._rawConfig = rawConfig
    this._clientEnv = null
    this._genericEnv = null
  }

  _init () {
    throw error('NOT_IMPLEMENT', '_init')
  }

  _loadClientEnv () {
    const envFile = path.join(this._cwd, 'roe.config', CLIENT_ENV_FILENAME)
    return readAndParse(envFile)
  }

  _loadGenericEnv () {
    const envFile = path.join(this._cwd, 'roe.config', GENERIC_ENV_FILENAME)
    return readAndParse(envFile)
  }

  // Initialize `this._env` for sandbox
  async __init () {
    try {
      this._clientEnv = this._rawConfig.clientEnvs
        || await this._loadClientEnv()
        || {}

      this._genericEnv = this._rawConfig.envs
        || await this._loadGenericEnv()
        || {}

      await this._init()
    } catch (err) {
      this[SET_ERROR](err)
      return
    }

    this[SET_READY]()
  }
}

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
  'ROE_CWD',
  'ROE_DEV'
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
class SandboxEnv extends BaseEnv {
  constructor ({
    cwd,
    dev
  }, rawConfig) {
    super(cwd, rawConfig)

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
  @awaitReady
  spawn (command, args, options = {}) {
    if (!options.stdio) {
      options.stdio = 'inherit'
    }

    options.env = {
      ...this._env,
      ROE_CWD: this._cwd
    }

    if (this._dev) {
      options.env.ROE_DEV = true
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

// 1. env converter to change the env
// 2. manage envs that should be populated into webpack
class AppEnv extends BaseEnv {
  constructor ({
    cwd,
    env = []
  }, rawConfig) {
    super(cwd, rawConfig)
    this._envConverters = env
    this._env = process.env

    this.__init()
  }

  async _init () {
    await this.convertEnv()
  }

  @awaitReady
  clientEnvKeys () {
    return Object.keys(this._clientEnv)
  }

  async convertEnv () {
    if (this._envConverters.length === 0) {
      return
    }

    await waterfall(
      this._envConverters,
      this._env,
      async (prev, converter) => {
        await converter(prev)
        return prev
      }
    )
  }
}

module.exports = {
  SandboxEnv,
  AppEnv
}
