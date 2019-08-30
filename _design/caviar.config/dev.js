module.exports = {
  // Configurations for caviar
  caviar: {
    // The config anchor for caviar
    mixer: NextRoe,
    plugins: [

    ]
  },

  // Config anchor for blocks
  next (withPlugins) {
    return withPlugins(nextPlugins, nextConfig)
  },

  router (app) {

  }
}

/**

- anchor

```pseudo

const next = config.compose({
  key: 'next',
  compose: composeNext
})

const nextConfig = next(phase, {
  defaultConfig
})
```

- can create sub configGetter

```pseudo

  const caviarConfig = config.createSubGetter('caviar')

  const plugins = caviarConfig.compose({
    key: 'plugins',
    compose: [].concat
  })

  const orchestrator = caviarConfig.bailBottom('orchestrator')
```

*/
