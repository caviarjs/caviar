const Koa = require('koa')

const {Mixer} = require('../../src')
const KoaBlock = require('./simple-koa-block')
const RouterBlock = require('./simple-router-block')

module.exports = class KoaRouterMixer extends Mixer {
  constructor () {
    super()

    this.blocks = {
      koa: {
        from: KoaBlock
      },
      router: {
        from: RouterBlock
      }
    }
  }

  mix ({
    koa,
    router
  }) {

  }
}
