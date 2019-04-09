// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const log = require('util').debuglog('roe-scripts:spawner')
const Server = require('../src/server')

const options = JSON.parse(process.argv[2])

log('spawner env: %s', JSON.stringify(process.env, null, 2))

new Server(options).start()
