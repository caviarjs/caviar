const assert = require('assert')

const {Mixer} = require('../..')
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
    const tasks = new Set([
      'foo-create',
      'bar-create',
      'foo-run',
      'bar-run'
    ])

    const test = () => {
      if (tasks.length !== 0) {
        throw new Error(`tasks ${[...tasks].join(', ')} not run`)
      }
    }

    foo.hooks.created.tap(SIMPLE_MIXER, created => {
      tasks.delete('foo-create')
      assert(created.foo === true, 'created.foo')
    })

    bar.hooks.created.tap(SIMPLE_MIXER, created => {
      tasks.delete('bar-create')
      assert(created.bar === true, 'created.bar')
    })

    foo.hooks.run.tapPromise(SIMPLE_MIXER, async ret => {
      tasks.delete('foo-run')
      assert(ret.foo === 'foo', 'run.foo')
    })

    bar.hooks.run.tapPromise(SIMPLE_MIXER, async ret => {
      tasks.delete('bar-run')
      assert(ret.bar === 'bar', 'run.bar')

      setTimeout(() => {
        test()
      }, 200)
    })
  }
}
