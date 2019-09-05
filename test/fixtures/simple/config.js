if (process.env.CAVIAR_PHASE !== 'default') {
  throw new Error(`process.env.CAVIAR_PHASE should be "default", but got ${process.env.CAVIAR_PHASE}`)
}

const SANDBOX_PLUGIN = 'SandboxPlugin'

module.exports = {
  caviar: {
    mixer: require('./layer/simple-mixer'),
    plugins: [
      {
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
    ]
  },

  foo: 'foo',
  bar: 'bar'
}
