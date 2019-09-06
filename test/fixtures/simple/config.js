if (process.env.CAVIAR_PHASE !== 'default') {
  throw new Error(`process.env.CAVIAR_PHASE should be "default", but got ${process.env.CAVIAR_PHASE}`)
}

const SANDBOX_PLUGIN = 'SandboxPlugin'

const plugin = {
  sandbox: true,
  apply (getHooks) {
    const hooks = getHooks()
    if (process.env.CAVIAR_SANDBOX === 'outer') {
      hooks.sandboxEnvironment.tapPromise(
        SANDBOX_PLUGIN,
        async sandbox => {
          sandbox.setEnv('SANDBOX_PLUGIN_ENV', 'YES')
        }
      )
      return
    }

    hooks.start.tap(SANDBOX_PLUGIN, () => {
      process.env.SANDBOX_PLUGIN_ENV += '-GREAT'
    })
  }
}

const plugins = []

if (process.env.TEST_SANDBOX_PLUGIN_VARIES) {
  plugins.push([
    process.env.TEST_SANDBOX_PLUGIN_FACTORY
      ? () => plugin
      : plugin,
    process.env.TEST_SANDBOX_PLUGIN_CONDITION_FACTORY
      ? () => process.env.CAVIAR_SANDBOX
      : {
        sandbox: true
      }
  ])
} else if (process.env.CONFIG_LOADER_INVALID_PLUGIN) {
  plugins.push(null)
} else {
  plugins.push(plugin)
}

module.exports = {
  caviar: {
    mixer: require('./layer/simple-mixer'),
    plugins
  },

  foo: 'foo',
  bar: 'bar'
}
