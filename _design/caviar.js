const config = require('./caviar.config')

await caviar({
  configLoaderClassPath,
  cwd,
  dev
})
.applyPlugins(RETURNS_TRUE)
.ready()
