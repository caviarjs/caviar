if (process.env.CAVIAR_PHASE !== 'default') {
  throw new Error('process.env.CAVIAR_PHASE not match')
}

module.exports = {
  caviar: {
    mixer: require('../simple-mixer')
  },

  foo: 'foo',
  bar: 'bar'
}
