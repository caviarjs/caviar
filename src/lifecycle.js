const {
  SyncHook,
  AsyncParallelHook
} = require('tapable')
const {
  Hooks,
  CLEAN
} = require('progress-hooks')

// const {readConfig} = require('./utils')

const createSandboxHooks = () => new Hooks({
  sandboxEnvironment: new SyncHook(['sandbox']),
})

const createNonSandboxHooks = dev => new Hooks({
  // Intercept into the last phase of environment setting
  environment: new AsyncParallelHook(['context']),
  // Intercept into the last phase of webpack config generating
  webpackConfig: {
    hook: new SyncHook(['webpackConfig', 'options']),
    plan: dev
      ? 2
      // We will run next/build when it is not in dev mode
      // TODO: it will call hook.webpackConfig 4 times, try to improve this
      : 4
  },

  serverConfig: new SyncHook(['roeConfig']),
  nextConfig: {
    hook: new SyncHook(['nextConfig']),
    plan: dev
      ? 1
      : 2
  }
})

class Lifecycle {
  constructor ({
    sandbox = false,
    configLoader,
    dev
  }) {
    this._sandbox = sandbox
    this._configLoader = configLoader
    this._dev = dev

    // Prevent plugins from accessing Lifecycle methods
    this._applyTarget = {
      hooks: sandbox
        ? createSandboxHooks()
        : createNonSandboxHooks(this._dev)
    }
  }

  get hooks () {
    return this._applyTarget.hooks
  }

  // - sandbox `boolean` whether the current process is sandbox
  applyPlugins () {
    this._configLoader.plugins.forEach(plugin => {
      // We only apply sandbox-specific plugins in sandbox
      if (this._sandbox === !plugin.sandbox) {
        return
      }

      plugin.apply(this._applyTarget)
    })
  }

  clearPlugins () {
    this.hooks[CLEAN]()
  }

  reloadConfig () {
    this._configLoader.reload()
  }
}

module.exports = {
  Lifecycle
}
