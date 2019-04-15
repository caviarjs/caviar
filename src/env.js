const path = require('path')
const log = require('util').debuglog('caviar')
const spawn = require('cross-spawn')
const {
  waterfall
} = require('promise.extra')

const {error} = require('./error')
const {Lifecycle} = require('./lifecycle')

// const ESSENTIAL_ENV_KEYS = [
//   // For util.debug
//   'NODE_DEBUG',
//   // For userland debug module
//   'DEBUG',
//   // For global installed npm packages
//   'NODE_PATH',
//   // For `child_process.spawn`ers
//   'PATH'
// ]

// // Private env keys used by roe,
// // which should not be changed by env plugins
// const PRIVATE_ENV_KEYS = [
//   'CAVIAR_CWD',
//   'CAVIAR_DEV'
// ]

// const createInheritEnv = host => key => {
//   if (PRIVATE_ENV_KEYS.includes(key)) {
//     throw error('PRESERVED_ENV_KEY', key)
//   }

//   const variable = process.env[key]
//   if (variable) {
//     host[key] = variable
//   }
// }

// const ensureEnv = host => {
//   const inheritEnv = createInheritEnv(host)
//   ESSENTIAL_ENV_KEYS.forEach(inheritEnv)
// }



// 1. env converter to change the env
// 2. manage envs that should be populated into webpack
// class AppEnv extends BaseEnv {
//   constructor ({
//     cwd,
//     env = []
//   }, rawConfig) {
//     super(cwd, rawConfig)
//     this._envConverters = env
//     this._env = process.env

//     this.__init()
//   }

//   async _init () {
//     await this.convertEnv()
//   }

//   @awaitReady
//   clientEnvKeys () {
//     return Object.keys(this._clientEnv)
//   }

//   async convertEnv () {
//     if (this._envConverters.length === 0) {
//       return
//     }

//     await waterfall(
//       this._envConverters,
//       this._env,
//       async (prev, converter) => {
//         await converter(prev)
//         return prev
//       }
//     )
//   }
// }

// module.exports = {
//   SandboxEnv,
//   AppEnv
// }
