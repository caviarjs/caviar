process.env.CAVIAR_NO_MOCK = 1

if (!process.env.NODE_PATH) {
  process.env.NODE_PATH = '/usr/local/lib/node_modules'
}

require('./integrated')
