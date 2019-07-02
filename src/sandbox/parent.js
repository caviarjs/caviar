
const path = require('path')
const log = require('util').debuglog('caviar')
const {fork} = require('child_process')
const {
  AsyncParallelHook
} = require('tapable')
const {isObject} = require('core-util-is')
const mix = require('mix2')

const {createError} = require('../error')
const {joinEnvPaths} = require('../utils')
const CaviarBase = require('../base/caviar')
const {
  IS_SANDBOX_PLUGIN,
  PHASE_DEFAULT,
  UNDEFINED
} = require('../constants')

const error = createError('SANDBOX')

const ESSENTIAL_ENV_KEYS = [
  // For util.debug
  'NODE_DEBUG',
  // For userland debug module
  'DEBUG',
  // For `child_process.spawn`ers
  'PATH'
]

// Private env keys used by roe,
// which should not be changed by env plugins
const PRIVATE_ENV_KEYS = [
  'CAVIAR_CWD',
  'CAVIAR_DEV'
]

const createSetEnv = host => (key, value) => {
  if (value !== undefined) {
    host[key] = value
  }
}

const createInheritEnv = set => key => {
  if (PRIVATE_ENV_KEYS.includes(key)) {
    throw error('PRESERVED_ENV_KEY', key)
  }

  set(key, process.env[key])
}

const ensureEnv = inheritEnv => {
  ESSENTIAL_ENV_KEYS.forEach(inheritEnv)
}

const composeEnvs = ({
  prev,
  anchor
}) => isObject(prev)
  ? {
    ...prev,
    ...anchor
  }
  : isObject(anchor)
    ? anchor
    : UNDEFINED

// Sandbox is a special block that
// Sanitize and inject new environment variables into
// the child process
module.exports = class Sandbox extends CaviarBase {
  constructor (options) {
    super(options, {
      sandboxEnvironment: new AsyncParallelHook(['sandbox', 'caviarOptions'])
    })

    const {
      configLoaderModulePath,
      stdio = 'inherit',
      sandbox
    } = options

    this._configLoaderModulePath = configLoaderModulePath
    this._stdio = stdio
    this._sandbox = sandbox

    this._config.load()
  }

  get spawner () {
    return path.join(__dirname, 'spawner.js')
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
  async _fork (command, args, options = {}) {
    if (!options.stdio) {
      options.stdio = this._stdio
    }

    const {cwd} = this._options

    options.env = {
      ...this._env,
      CAVIAR_CWD: cwd
    }

    const {dev} = this._options

    if (dev) {
      options.env.CAVIAR_DEV = true
    }

    const setEnv = createSetEnv(options.env)
    const inheritEnv = createInheritEnv(setEnv)

    ensureEnv(inheritEnv)

    // TODO: a better solution
    // Just a workaround that webpack fails to compile babeled modules
    // which depends on @babel/runtime-corejs2
    options.env.NODE_PATH = joinEnvPaths(
      process.env.NODE_PATH,
      ...this._config.getNodePaths()
    )

    this.applyPlugins(IS_SANDBOX_PLUGIN)

    const sandbox = {
      inheritEnv,
      setEnv
    }

    const hooks = this._hooksManager.getHooks()

    // Apply sandbox env plugins
    await hooks.sandboxEnvironment.promise(sandbox, this._options)

    const envs = this._caviarConfig.compose({
      key: 'envs',
      compose: composeEnvs
    }, {})

    // Do not override existing properties
    mix(options.env, envs, false)

    log('spawn: %s %j', command, args)

    return fork(command, args, options)
  }

  // For override
  _spawnArgs (phase) {
    return [
      JSON.stringify({
        ...this._options,
        sandbox: this._sandbox,
        phase,
        configLoaderModulePath: this._configLoaderModulePath
      })
    ]
  }

  async run (phase = PHASE_DEFAULT) {
    const {spawner} = this
    const args = this._spawnArgs(phase)

    return this._fork(spawner, args)
  }

  // TODO: reload sandbox if watcher emits
  _reload () {
    this._initHooksManager()
    this._config.load()
  }
}
