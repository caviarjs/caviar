module.exports = {
  multi: {
    dev: {
      // config loader
      // this preset installed as a dev dependency
      preset: 'caviar-layer-dev',
      configFile: require.resolve('./dev')
    },

    start: {
      // Installed as a normal dependency
      preset: 'caviar-layer'
      configFile: require.resolve('./start')
    }
  }
}
