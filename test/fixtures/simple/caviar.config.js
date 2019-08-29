if (process.env.CAVIAR_PHASE !== 'default') {
  throw new Error('process.env.CAVIAR_PHASE not match')
}

module.exports = {
  caviar: {
    mixer: require('../simple-mixer')
  },

  port: 50003,

  router (router) {
    router.get('/hello', ctx => {
      ctx.body = 'hello world'
    })
  }
}
