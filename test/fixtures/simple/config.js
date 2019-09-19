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

const Plugin = require('./layer/plugin')
const PluginPlugin = require('./layer/plugin-plugin')

const plugins = [
  [
    {
      // This plugin never called
      apply () {
        throw new Error('boooooooooom!')
      }
    },
    () => false
  ],
  new Plugin(),
  new PluginPlugin()
]

if (process.env.TEST_SANDBOX_PLUGIN_VARIES) {
  plugins.push([
    process.env.TEST_SANDBOX_PLUGIN_FACTORY
      ? () => plugin
      : plugin,
    process.env.TEST_SANDBOX_PLUGIN_CONDITION_FACTORY
      ? () => process.env.CAVIAR_SANDBOX
      : {
        sandbox: true,
        phase: 'default'
      }
  ])
} else if (process.env.CONFIG_LOADER_INVALID_PLUGIN) {
  plugins.push(null)
} else if (process.env.CONFIG_LOADER_INVALID_PLUGIN_CONDITION) {
  plugins.push([() => {}, 1])
} else {
  plugins.push(plugin)
}

if (process.env.HOOKABLE_NO_CLASS) {
  plugins.push(require('./gethooks-wrong-type'))
}

if (process.env.HOOKABLE_NOT_HOOKABLE) {
  plugins.push(require('./gethooks-no-hookable'))
}

const caviar = {
  mixer: process.env.INVALID_MIXER
    ? 1
    : require('./layer/simple-mixer'),
  plugins: process.env.CONFIG_LOADER_INVALID_PLUGINS
    ? 1
    : plugins,
  env: {
    CAVIAR_ENV_FOO: 'foo'
  }
}

module.exports = {
  caviar,
  foo: 'foo',
  bar: 'bar'
}
