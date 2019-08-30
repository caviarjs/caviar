const test = require('ava')

const {Sandbox} = require('../src/sandbox/parent')

test('invalid options', t => {
  t.throws(() => new Sandbox(), {
    code: 'INVALID_OPTIONS'
  })
})

test('invalid cwd', t => {
  t.throws(() => new Sandbox({}), {
    code: 'INVALID_CWD'
  })
})

test('invalid preset', t => {
  t.throws(() => new Sandbox({
    cwd: 'fake'
  }), {
    code: 'INVALID_PRESET'
  })
})

// test('invalid server path', t => {
//   t.throws(() => new Sandbox({
//     serverClassPath: null,
//     cwd: __dirname
//   }), {
//     code: CODE('INVALID_SERVER_CLASS_PATH')
//   })
// })

// test('invalid loader path', t => {
//   t.throws(() => new Sandbox({
//     configLoaderClassPath: null,
//     cwd: __dirname
//   }), {
//     code: CODE('INVALID_CONFIG_LOADER_CLASS_PATH')
//   })
// })
