const test = require('ava')

const {create} = require('./fixtures/simple/create')

const CASES = [
  // process env key, error message
  ['INVALID_PHASES', 'phases must be array of strings'],
  ['CREATE_NOT_IMPLEMENTED', 'method "create" must be implemented'],
  ['RUN_NOT_IMPLEMENTED', 'method "run" must be implemented'],
  ['MIXER_INVALID_CONFIG_GETTER_TYPE', 'an invalid config getter'],
  ['MIXER_CONFIG_NOT_OPTIONAL', 'it is not optional'],
  ['MIXER_NOT_IMPLEMENTED', 'method "mix" must be implemented'],
]

const run = async key => {
  const child = await create({
    sandbox: true,
    stdio: 'pipe',
    env: {
      [key]: 'true'
    }
  })

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

CASES.forEach(([key, message]) => {
  test(key, async t => {
    const {
      error,
      stderr
    } = await run(key)

    t.is(error.code, 'CHILD_PROCESS_NONE_ZERO_EXIT_CODE')

    if (message && stderr.includes(message)) {
      return
    }

    // eslint-disable-next-line no-console
    console.error(stderr)

    t.fail('stderr not match')
  })
})
