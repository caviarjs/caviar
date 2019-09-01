const {Mixer} = require('../../src')
const FooBlock = require('./foo-block')
const BarBlock = require('./bar-block')

const SIMPLE_MIXER = 'SimpleMixer'

module.exports = class KoaRouterMixer extends Mixer {
  constructor () {
    super()

    this.blocks = {
      foo: {
        from: FooBlock
      },
      bar: {
        from: BarBlock
      }
    }
  }

  mix ({
    koa,
    router
  }) {
    koa.hooks.created.tap(SIMPLE_MIXER, app => {
      router.hooks.created.tap(SIMPLE_MIXER, () => {
        router.attach(app)
      })
    })
  }
}
