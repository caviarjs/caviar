const assert = require('assert')

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
    foo,
    bar
  }) {
    let count = 0

    foo.hooks.created.tap(SIMPLE_MIXER, created => {
      count ++
      assert(created.foo === true, 'created.foo')
    })

    bar.hooks.created.tap(SIMPLE_MIXER, created => {
      count ++
      assert(created.bar === true, 'created.bar')
    })

    foo.hooks.run.tapPromise(SIMPLE_MIXER, ret = {
      asset(created.foo === 'foo', 'run.foo')
    })

    bar.hooks.run.tapPromise(SIMPLE_MIXER, ret = {
      asset(created.bar === 'bar', 'run.bar')
    })
  }
}
