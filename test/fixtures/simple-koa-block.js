const Koa = require('koa')
const {SyncHook} = require('tapable')
const {Block} = require('../../src')

module.exports = class KoaBlock extends Block {
  constructor () {
    super()

    this.config = {
      port: {
        type: 'bailTop'
      }
    }

    this.hooks = {
      listening: new SyncHook(['port'])
    }
  }

  create () {
    return new Koa()
  }

  async run (config) {
    const {port} = config

    return new Promise(resolve => {
      this.outlet.listen(port, () => {
        this.hooks.listening.call(port)
        resolve()
      })
    })
  }
}
