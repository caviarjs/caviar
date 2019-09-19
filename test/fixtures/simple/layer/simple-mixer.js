const assert = require('assert')

const {Mixer} = require('../../../..')
const FooBlock = require('./foo-block')
const BarBlock = require('./bar-block')

const SIMPLE_MIXER = 'SimpleMixer'

const nowMatch = (key) => {
  throw new Error(
    `process.env.${key} not match, got "${process.env[key]}"`)
}

class FooBarMixer extends Mixer {
  constructor () {
    super()

    const phaseMap = {}

    if (process.env.MIXER_INVALID_PHASE) {
      phaseMap.default = 1
    }


    const blocks = {
      foo: {
        from: FooBlock,
        phaseMap
      },
      bar: {
        from: BarBlock
      }
    }

    if (process.env.RESERVED_NAMESPACE) {
      blocks.foo.namespace = 'caviar'
    }

    this.blocks = blocks
  }
}

if (!process.env.MIXER_NOT_IMPLEMENTED) {
  FooBarMixer.prototype.mix = async function mix ({
    foo,
    bar
  }) {
    const tasks = new Set([
      'foo-create',
      'bar-create',
      'foo-run',
      'bar-run'
    ])

    let resolve

    const test = new Promise(r => {
      resolve = r
    }).then(() => {
      if (process.env.TEST_BLOCK_PHASES) {
        if (!(
          tasks.size === 2
          && tasks.has('foo-create')
          && tasks.has('foo-run')
        )) {
          throw error('test for TEST_BLOCK_PHASES fails')
        }
        return
      }

      if (tasks.size !== 0) {
        throw new Error(`tasks ${[...tasks].join(', ')} not run`)
      }
    })

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

      if (
        process.env.CAVIAR_SANDBOX
        && process.env.PLUGIN_PLUGIN_ENV !== 'plugin'
      ) {
        nowMatch('PLUGIN_PLUGIN_ENV')
      }
    })

    bar.hooks.run.tapPromise(SIMPLE_MIXER, async ret => {
      tasks.delete('bar-run')
      assert(ret.bar === 'bar', 'run.bar')

      setTimeout(() => {
        resolve()
      }, 200)
    })

    if (process.env.TEST_SANDBOX_PLUGIN) {
      if (process.env.CAVIAR_SANDBOX !== 'inner') {
        nowMatch('CAVIAR_SANDBOX')
      }

      if (process.env.SANDBOX_PLUGIN_ENV !== 'YES-GREAT') {
        nowMatch('SANDBOX_PLUGIN_ENV')
      }
    }

    if (process.env.CAVIAR_ENV_FOO !== 'foo') {
      nowMatch('CAVIAR_ENV_FOO')
    }

    await test
  }
}

module.exports = FooBarMixer
