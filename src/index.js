const {monitor} = require('./sandbox/process')
const {version} = require('../package.json')

module.exports = {
  caviar: require('./factory'),
  Block: require('./block'),
  Mixer: require('./mixer'),
  Plugin: require('./plugin'),
  ConfigLoader: require('./config/loader'),
  monitor,
  version
}
