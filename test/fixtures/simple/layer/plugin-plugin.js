const Plugin = require('./plugin')

module.exports = class PluginPlugin {
  apply (getHooks) {
    getHooks(Plugin).foo.tap('PLUGIN', () => {
      process.env.PLUGIN_PLUGIN_ENV = 'plugin'
    })
  }
}
