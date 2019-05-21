const RoeBlock = require('@caviar/block-roe')
const {set} = require('object-access')

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
    next.hooks.afterReady.tap('XXX', nextApp => {
      roe.hooks.creating.tap('XXX', options => {
        set(options, ['extends.next'], nextApp)
      })

      roe.hooks.afterReady.tap('XXX', roeApp => {
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
