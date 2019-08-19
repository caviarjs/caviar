const Router = require('koa-router')

const {Block} = require('../../src')

module.exports = class RouterBlock extends Block {
  constructor () {
    super()

    this.config = {
      router: {
        type: 'bailTop'
      }
    }
  }

  create () {
    return new Router()
  }

  async run (config) {
    config.router(this.outlet)
  }

  attach (app) {
    app.use(this.outlet.routes())
    app.use(this.outlet.allowedMethods())
  }
}
