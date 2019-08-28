const {Mixer} = require('../../src')
const KoaBlock = require('./simple-koa-block')
const RouterBlock = require('./simple-router-block')

const KOA_ROUTER_MIXER = 'KoaRouterMixer'

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
    koa.hooks.created.tap(KOA_ROUTER_MIXER, app => {
      router.hooks.created.tap(KOA_ROUTER_MIXER, () => {
        router.attach(app)
      })
    })
  }
}
