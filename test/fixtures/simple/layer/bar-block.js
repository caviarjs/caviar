const delay = require('delay')

const {Block} = require('../../../..')

module.exports = class BarBlock extends Block {
  constructor () {
    super()

    this.config = {
      bar: {
        type: 'bailTop'
      }
    }
  }

  create (config) {
    return {
      bar: config.bar === 'bar'
    }
  }

  async run (config) {
    await delay(100)

    return {
      bar: config.bar
    }
  }

  method () {
    return this.created
  }
}
