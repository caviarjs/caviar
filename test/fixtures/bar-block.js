const delay = require('delay')

const {Block} = require('../../src')

module.exports = class RouterBlock extends Block {
  constructor () {
    super()

    this.config = {
      bar: {
        type: 'bailTop'
      }
    }
  }

  create () {
    return {
      bar: true
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
