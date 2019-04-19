module.exports = {
  plugins: [
    {
      sandbox: true,
      apply (lifecycle) {
        lifecycle.hooks.sandboxEnvironment.tap(
          'ErrorSandboxPlugin',
          sandbox => {
            sandbox.inheritEnv('CAVIAR_CWD')
          }
        )
      }
    }
  ]
}
