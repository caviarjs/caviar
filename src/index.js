const ConfigLoader = require('./config/loader')
const {monitor} = require('./sandbox/process')
const {Block} = require('./block')
const Mixer = require('./mixer')
const Plugin = require('./plugin')
const Caviar = require('./caviar')
const {Sandbox} = require('./sandbox/parent')

const caviar = (options = {}) => options.sandbox
  ? new Sandbox(options)
  : new Caviar(options)

const {version} = require('../package.json')

module.exports = {
  caviar,
  Block,
  Mixer,
  Plugin,
  ConfigLoader,
  monitor,
  version
}
