/* eslint-disable no-console */

// This JavaScript file should be spawned with
// `node /path/to/spawner/start.js ${optionsJSON}`
const log = require('util').debuglog('caviar:spawner')

const {
  phase,
  ...options
} = JSON.parse(process.argv[2])

log('spawner env: %s', JSON.stringify(process.env, null, 2))

const Caviar = require('../caviar')
const {IS_NOT_SANDBOX_PLUGIN} = require('../constants')

new Caviar(options)
.applyPlugins(IS_NOT_SANDBOX_PLUGIN)
.run(phase)
.catch(err => {
  console.error(`fails to run, phase:${phase}, reason:\n${err.stack}`)
  process.exit(1)
})
