if (process.env.CAVIAR_PHASE !== 'default') {
  throw new Error(`process.env.CAVIAR_PHASE should be "default", but got ${process.env.CAVIAR_PHASE}`)
}

module.exports = {
  caviar: {
    mixer: require('./layer/simple-mixer')
  },

  foo: 'foo',
  bar: 'bar'
}
