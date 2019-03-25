// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const Server = require('../lib/server')

const options = JSON.parse(process.argv[2])

new Server(options).start()
