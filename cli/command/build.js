const path = require('path')
const log = require('util').debuglog('caviar:build')
const Command = require('common-bin')

module.exports = class BuildCommand extends Command {
  constructor (raw) {
    super(raw)
  }
}
