module.exports = {
  // Configurations for caviar
  caviar: {
    // The config anchor for caviar
    orchestrator: NextRoe
    plugins: [

    ],
    // If with sandbox
    withSandbox: false
  },

  // Config anchor for blocks
  next () {

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
