module.exports = {
  multi: {
    dev: {
      // config loader
      preset: 'caviar-layer-dev',
      configFile: require.resolve('./dev')
    },

    start: {
      preset: 'caviar-layer'
      configFile: require.resolve('./start')
    }
  }
}
