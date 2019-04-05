const path = require('path')
const log = require('util').debuglog('roe-scripts:start')
const Command = require('common-bin')

const {
  SandboxEnv
} = require('../../src/env')

module.exports = class StartCommand extends Command {
  constructor (raw) {
    super(raw)

    this.options = {
      port: {
        type: 'number',
        description: 'server port',
        default: 7001
      },

      dev: {
        type: 'boolean',
        description: 'whether start the server in development mode',
        default: false
      },

      cwd: {
        type: 'string',
        description: 'set the current working directory',
        default: process.cwd()
      }
    }
  }

  async run ({
    argv
  }) {
    const {
      port,
      dev,
      cwd
    } = argv

    const sandboxEnv = new SandboxEnv({
      cwd,
      dev
    })
    const spawner = path.join(__dirname, '..', '..', 'spawner', 'start.js')
    const command = 'node'

    const options = {
      cwd,
      port,
      dev
    }

    const node = await sandboxEnv.spawn(
      command, [
        spawner,
        JSON.stringify(options)
      ]
    )
  }
}
