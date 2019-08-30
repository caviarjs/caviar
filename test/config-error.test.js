const test = require('ava')
const {fixture} = require('./fixtures/config-loader/create')

const ERROR_CASES = [
  ['error-no-config-file', 'CONFIG_FILE_GETTER_REQUIRED'],
  ['error-config-file-not-found', 'PATH_NOT_FOUND'],
  ['error-config-file-not-absolute', 'PATH_NOT_ABSOLUTE'],
  ['error-number-node-modules', 'INVALID_NODE_PATH'],
  ['error-config-file', 'INVALID_CONFIG_FILE'],
  ['error-config-errored', 'CONFIG_ERRORED', () => {}]
]

const CODE = suffix => `CONFIG_LOADER_${suffix}`

ERROR_CASES.forEach(([dir, suffix, runner]) => {
  test(`error: ${dir}`, t => {
    const ConfigLoader = require(fixture(dir, 'config-loader.js'))

    const cl = new ConfigLoader()

    const code = CODE(suffix)

    t.throws(() => {
      cl.getPaths()

      if (runner) {
        cl.load()
        runner(cl)
      }
    }, {
      code
    })
  })
})
