const config = module.exports = {
  clientEnvs: {
    HELLO_WORLD: 'hello'
  },
  plugins: []
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
