const {caviar} = require('../../..')

const configFile = require.resolve('./config')

const create = (rawOptions = {}) => {
  const {
    env,
    ...options
  } = rawOptions

  options.cwd = __dirname
  options.configFile = configFile

  const {
    sandbox
  } = options

  if (sandbox) {
    options.env = env
  } else {
    Object.assign(process.env, env)
  }

  return caviar(options).run()
}

module.exports = {
  create
}
