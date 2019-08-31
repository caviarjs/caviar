
const path = require('path')
const log = require('util').debuglog('caviar')
const {
  AsyncParallelHook
} = require('tapable')
const {isObject} = require('core-util-is')

const {createError} = require('../error')
const {joinEnvPaths} = require('../utils')
const CaviarBase = require('../base/caviar')
const {
  IS_SANDBOX_PLUGIN,
  IS_SANDBOX,
  UNDEFINED
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
class Sandbox extends CaviarBase {
  constructor (options) {
    super(options, {
      sandboxEnvironment: new AsyncParallelHook(['sandbox', 'caviarOptions'])
    })

    const {
      configLoaderModulePath,
      stdio = 'inherit',
      sandbox
    } = options

    this[IS_SANDBOX] = true

    this._configLoaderModulePath = configLoaderModulePath
    this._stdio = stdio
    this._sandbox = sandbox

    this._config.load()
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

    // TODO: a better solution than NODE_PATH
    options.env.NODE_PATH = joinEnvPaths(
      process.env.NODE_PATH,
      ...this._config.getNodePaths()
    )

    this._applyPlugins(IS_SANDBOX_PLUGIN)

    const sandbox = {
      inheritEnv: createInheritEnv(setEnv, true),
      setEnv
    }

    const hooks = this._hooksManager.getHooks()

    // Apply sandbox env plugins
    await hooks.sandboxEnvironment.promise(sandbox, this._options)

    Object.assign(
      options.env,

      // caviar.envs
      // which always included in the repo
      this._caviarConfig.compose({
        key: 'envs',
        compose: composeEnvs
      }),

      // .env file which could be ignored by .gitignore
      this._caviarConfig.compose({
        key: 'dotenvs',
        compose: composeEnvs
      })
    )

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
    const args = this._spawnArgs(phase)

    return this._fork(spawner, args)
  }
}

module.exports = {
  Sandbox,
  composeEnvs
}
