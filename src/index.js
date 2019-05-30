// const Server = require('./block/server')
// const Sandbox = require('./sandbox')
const ConfigLoader = require('./config/loader')
const {monitor} = require('./sandbox/child-process')
const {requireModule} = require('./utils')
const {Block} = require('./block')
const Binder = require('./binder')
const {caviar} = require('./caviar')

module.exports = {
  // Server,
  // Sandbox,
  caviar,
  Block,
  Binder,
  ConfigLoader,
  utils: {
    monitor,
    requireModule
  }
}
