
const path = require('path')
const log = require('util').debuglog('caviar')
const {
  AsyncParallelHook
} = require('tapable')
const {isObject} = require('core-util-is')

const {createError} = require('../error')
const {
  isSandboxPlugin
} = require('../utils')
const CaviarBase = require('../base/caviar')
const {
  IS_SANDBOX
} = require('../constants')
const {fork} = require('./process')

const error = createError('SANDBOX')

// Env key used by caviar plugins and blocks,
// which should not be changed by env plugins
const PRIVATE_ENV_KEYS = [
  'CAVIAR_CWD',
  'CAVIAR_DEV',
  'CAVIAR_PHASE'
]

const ESSENTIAL_ENV_KEYS = [
  // For util.debug
  'NODE_DEBUG',
  // For userland debug module
  'DEBUG',
  // For `child_process.spawn`ers
  'PATH',

  ...PRIVATE_ENV_KEYS
]

const createSetEnv = host => (key, value) => {
  // `process.env.FOO = undefined` is equivalent to
  // `process.env.FOO = 'undefined'`
  if (value !== undefined) {
    host[key] = value
  }
}

const createInheritEnv = (set, check) => key => {
  if (check && PRIVATE_ENV_KEYS.includes(key)) {
    throw error('PRESERVED_ENV_KEY', key)
  }

  set(key, process.env[key])
}

const ensureEnv = inheritEnv => {
  ESSENTIAL_ENV_KEYS.forEach(inheritEnv)
}

// Sandbox is a special block that
// Sanitize and inject new environment variables into
// the child process
class Sandbox extends CaviarBase {
  constructor (options) {
    super(options, {
      sandboxEnvironment: new AsyncParallelHook(['sandbox', 'caviarOptions'])
    })

    const {
      env = {},
      stdio = 'inherit'
    } = options

    this[IS_SANDBOX] = true

    if (!isObject(env)) {
      throw error('INVALID_ENV', env)
    }

    this._env = env
    this._stdio = stdio
  }

  get spawner () {
    return path.join(__dirname, 'spawner.js')
  }

  async _fork (command, args) {
    const options = {
      stdio: this._stdio,
      env: {}
    }

    const setEnv = createSetEnv(options.env)
    const justInheritEnv = createInheritEnv(setEnv)

    ensureEnv(justInheritEnv)

    this._applyNodePaths(options.env)

    this._applyPlugins(isSandboxPlugin)

    const sandbox = {
      inheritEnv: createInheritEnv(setEnv, true),
      setEnv
    }

    const hooks = this._hooksManager.getHooks()

    // Apply sandbox env plugins
    await hooks.sandboxEnvironment.promise(sandbox, this._options)

    Object.assign(options.env, this._env)

    this._applyCaviarEnv(options.env)

    log('spawn: %s %j', command, args)

    return fork(command, args, options)
  }

  // For override
  _spawnArgs (phase) {
    return [
      JSON.stringify({
        ...this._options,
        phase
      })
    ]
  }

  // Usage
  // ```js
  // const subprocess = await caviar({
  //   sandbox: true
  // }).run()
  // ```

  // await for caviar of the subprocess executed
  // ```js
  // await subprocess.ready()
  // ```

  // If the subprocess is a server or a job which must hang on, then
  // ```js
  // await monitor(subprocess)
  // ```
  async _run (phase) {
    const {spawner} = this

    this._config.load()

    const args = this._spawnArgs(phase)

    return this._fork(spawner, args)
  }
}

module.exports = {
  Sandbox
}
