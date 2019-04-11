// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const log = require('util').debuglog('roe-scripts:spawner')

const {
  // Pass `serverPath` as an option,
  // so that user can extends `require('roe-scripts').Server`,
  // and use spawner to start ther own server
  serverPath,
  ...options
} = JSON.parse(process.argv[2])

log('spawner env: %s', JSON.stringify(process.env, null, 2))

const Server = require(serverPath)
new Server(options).start()
