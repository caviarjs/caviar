const path = require('path')
const {isString} = require('core-util-is')

const {
  error
} = require('./error')
const {
  SandboxEnv
} = require('./env')
const {getRawConfig} = require('./utils')

module.exports = class Sandbox {
  constructor (options = {}) {
    if (!isString(options.serverPath)) {
      throw error('INVALID_SERVER_PATH', options.serverPath)
    }

    this._options = options
  }

  async start () {
    const {
      cwd,
      dev
    } = this._options

    const {
      config
    } = getRawConfig(cwd)

    const sandboxEnv = new SandboxEnv({
      cwd,
      dev
    }, config)

    const spawner = path.join(__dirname, '..', 'spawner', 'start.js')
    const command = 'node'

    // TODO: child process events
    await sandboxEnv.spawn(
      command, [
        spawner,
        JSON.stringify(this._options)
      ]
    )
  }
}
