const config = module.exports = {
  clientEnvs: {
    HELLO_WORLD: 'hello'
  },
  plugins: [],
  next: withPlugins => withPlugins([], {
    webpack (c) {
      return c
    }
  })
}

if (process.env.CAVIAR_INCLUDE_SANDBOX_PLUGIN) {
  config.plugins.push({
    sandbox: true,
    apply (lifecycle) {
      lifecycle.hooks.sandboxEnvironment.tap(
        'FakeSandboxEnvPlugin',
        ({inheritEnv}) => {
          inheritEnv('HELLO_WORLD2')
        }
      )
    }
  })
}

switch (process.env.CAVIAR_APP_TYPE) {
case 'FAKE_ENV_PLUGIN':
  config.plugins.push({
    apply (lifecycle) {
      lifecycle.hooks.environment.tapPromise(
        'FakeEnvPlugin',
        async () => {
          process.env.HELLO_WORLD = 'dismiss'
        }
      )
    }
  })
  break

default:
}
