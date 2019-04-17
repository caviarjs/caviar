// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const log = require('util').debuglog('caviar:spawner')
const {requireModule} = require('../src/utils')

const {
  // Pass `serverClassPath` as an option,
  // so that user can extends `require('caviar').Server`,
  // and use spawner to start the own server
  serverClassPath,
  ...options
} = JSON.parse(process.argv[2])

log('spawner env: %s', JSON.stringify(process.env, null, 2))

const Server = requireModule(serverClassPath)

new Server(options).ready()
.then(server => {
  server.listen()
})
.catch(err => {
  console.error(`fails to start, reason:\n${err.stack}`)
  process.exit(1)
})
