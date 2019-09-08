const test = require('ava')
const {isString} = require('core-util-is')
const {join} = require('path')

const {create} = require('./fixtures/simple/create')

test('invalid phase', async t => {
  await t.throwsAsync(() => create({}, false), {
    code: 'INVALID_PHASE'
  })
})

const CASES = [
  // process env key, error message
  ['INVALID_PHASES', 'phases must be array of strings'],
  ['CREATE_NOT_IMPLEMENTED', 'method "create" must be implemented'],
  ['RUN_NOT_IMPLEMENTED', 'method "run" must be implemented'],
  ['MIXER_INVALID_CONFIG_GETTER_TYPE', 'an invalid config getter'],
  ['MIXER_CONFIG_NOT_OPTIONAL', 'it is not optional'],
  ['MIXER_NOT_IMPLEMENTED', 'method "mix" must be implemented'],
  ['CONFIG_LOADER_INVALID_PLUGIN', 'a plugin must be an object'],
  ['MIXER_INVALID_PHASE', 'mapped phase in phaseMap'],
  ['CONFIG_LOADER_INVALID_PLUGINS', 'must be an array'],
  ['CONFIG_LOADER_INVALID_PLUGIN_CONDITION', 'an object or a function'],
  ['HOOKABLE_RESERVED_HOOK_NAME', 'a reserved hook name'],
  ['HOOKABLE_INVALID_HOOKS', 'hooks must be an object'],
  ['HOOKABLE_ERR_SET_HOOKS', 'more than once'],
  ['HOOKABLE_NO_CLASS', 'must be a constructor'],
  ['HOOKABLE_NOT_HOOKABLE', 'must extend Hookable'],
  [{
    cwd: join(__dirname, 'fixtures', 'simple', 'no-pkg')
  }, 'package.json not found'],
  [{
    cwd: join(__dirname, 'fixtures', 'simple', 'err-pkg')
  }, 'fails to load package.json']
]

const run = async options => {
  const child = await create({
    sandbox: true,
    stdio: 'pipe',
    ...options
  }, options.phase)

  const list = []
  child.stderr.on('data', chunk => {
    list.push(chunk)
  })

  try {
    await child.ready()
  } catch (error) {
    return {
      error,
      stderr: Buffer.concat(list).toString()
    }
  }

  return {
    error: null,
    stderr: ''
  }
}

CASES.forEach(([options, message]) => {
  options = isString(options)
    ? {
      env: {
        [options]: 'true'
      }
    }
    : options

  test(JSON.stringify(options), async t => {
    const {
      error,
      stderr
    } = await run(options)

    t.is(error.code, 'CHILD_PROCESS_NONE_ZERO_EXIT_CODE')

    if (message && stderr.includes(message)) {
      return
    }

    // eslint-disable-next-line no-console
    console.error(stderr)

    t.fail('stderr not match')
  })
})
