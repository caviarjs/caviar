const path = require('path')
const Command = require('common-bin')

const command_dir = path.join(__dirname, 'command')

module.exports = class MainCommand extends Command {
  constructor (raw) {
    super(raw)

    this.load(command_dir)

    this.yargs.alias('V', 'version')
    this.yargs.alias('V', 'v')
  }
}
