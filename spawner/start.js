// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const Server = require('../src/server')

const options = JSON.parse(process.argv[2])

console.log('spawner env:', process.env)

new Server(options).start()
