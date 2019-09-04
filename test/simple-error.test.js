const test = require('ava')

const {create} = require('./fixtures/simple/create')

const CASES = [
  ['INVALID_PHASES', 'phases must be array of strings']
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

    if (stderr.includes(message)) {
      return
    }

    // eslint-disable-next-line no-console
    console.error(stderr)

    t.fail('stderr not match')
  })
})
