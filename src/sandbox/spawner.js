// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`

const log = require('util').debuglog('caviar:spawner')

const {IS_CHILD_PROCESS} = require('../constants')

const {
  phase,
  ...options
} = JSON.parse(process.argv[2])

log('spawner env: %s', JSON.stringify(process.env, null, 2))

const Caviar = require('../caviar')

options[IS_CHILD_PROCESS] = true

new Caviar(options)
.run(phase)
.catch(err => {
  // eslint-disable-next-line no-console
  console.error(`fails to run, phase:${phase}, reason:\n${err.stack}`)
  process.exit(1)
})
