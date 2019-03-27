const path = require('path')
const log = require('util').debuglog('roe-scripts:lib')
const {
  parse
} = require('dotenv')
const fs = require('mz/fs')
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

const {error} = require('./error')

const readFile = async file => {
  try {
    const content = await fs.readFile(file)
    return content.toString()
  } catch (err) {
    // do nothing
  }
}

const readAndParse = async file => {
  const content = await readFile(file)
  return parse(content)
}

const CLIENT_ENV_FILENAME = 'client.env'
const GENERIC_ENV_FILENAME = '.env'

// Ref
// https://github.com/tc39/proposal-decorators/blob/7fa580b40f2c19c561511ea2c978e307ae689a1b/METAPROGRAMMING.md

// Used for spawner
@setup
class BaseEnv {
  constructor (cwd) {
    this._cwd = cwd
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
      this._clientEnv = await this._loadClientEnv()
      this._genericEnv = await this._loadGenericEnv()
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
  'NODE_PATH'
]

const ensureEnv = host => {
  ESSENTIAL_ENV_KEYS.forEach(key => {
    const variable = process.env[key]
    if (variable) {
      host[key] = variable
    }
  })
}

// Sanitize and inject new environment variables into
// the child process
class SandboxEnv extends BaseEnv {
  constructor ({
    cwd,
    dev
  }) {
    super(cwd)

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

    const {PATH} = process.env
    options.env = {
      ...this._env,
      PATH,
      ROE_CWD: this._cwd
    }

    if (this._dev) {
      options.env.ROE_DEV = true
    }

    ensureEnv(options.env)

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
  }) {
    super(cwd)
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
