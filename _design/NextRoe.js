// Orchestrator
///////////////////////////////////////////////
const RoeBlock = require('@caviar/block-roe')
const {set} = require('object-access')

// Thinking:
// Should Orchestrator and Block extend the same interface?

class NextRoe extends Orchestrator {
  constructor (options) {
    super(options)

    this.blocks = {
      next: {
        from: NextBlock,
        config: {
          key: 'next'
        }
      },
      roe: {
        from: RoeBlock
      },
      server: {

      }
    }
  }

  async _orchestrate ({
    next,
    roe
  }) {
    next.hooks.created.tap('XXX', nextApp => {
      roe.hooks.creating.tap('XXX', options => {
        set(options, ['extends.next'], nextApp)
      })

      roe.hooks.ready.tap('XXX', roeApp => {
        // Set the Orchestrator as ready
        this.ready(roeApp)
      })

      roe.start()
    })

    next.start()

    await Promise.all([
      next.ready(),
      roe.ready()
    ])
  }
}
