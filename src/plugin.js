const {
  Hookable
} = require('./base/hookable')

// If a user-land plugin wants to support hooks
// it must extend caviar.Plugin which is actually a hookable
module.exports = class Plugin extends Hookable {}
