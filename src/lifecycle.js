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
  sandboxEnvironment: new AsyncParallelHook(['sandbox']),
})

const createNonSandboxHooks = () => new Hooks({
  // Intercept into the last phase of environment setting
  environment: new AsyncParallelHook(['context']),
  // Intercept into the last phase of webpack config generating
  webpackConfig: new SyncHook(['webpackConfig', 'options']),
  serverConfig: new SyncHook(['serverConfig']),
  nextConfig: new SyncHook(['nextConfig'])
}, {
  disableAfterCalled: false
})

class Lifecycle {
  constructor ({
    sandbox = false,
    configLoader
  }) {
    this._sandbox = sandbox
    this._configLoader = configLoader

    // Prevent plugins from accessing Lifecycle methods
    this._applyTarget = {
      hooks: sandbox
        ? createSandboxHooks()
        : createNonSandboxHooks()
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
