const {createError} = require('../error')

const error = createError('BLOCK')

const PREFIX = 'caviar:block.id'

// The performance of accessing a symbol property or a normal property
// is nearly the same
// https://jsperf.com/normal-property-vs-symbol-prop
const blockIdentifierSymbol = Symbol.for(PREFIX)

const createBlockIdentifier = constructor =>
  Symbol.for(`${PREFIX}:${constructor.name}`)

class Block {
  constructor () {
    this[blockIdentifierSymbol] = createBlockIdentifier(this.constructor)
    this._app = null
    this._config = null
  }

  set config (config) {

  }

  get config () {

  }

  ready () {
    const app = this._app || this.create()
  }

  create (options, caviarOptions) {

    this._app = this._create(options, caviarOptions)

    return this._app
  }

  _create () {
    throw error('NOT_IMPLEMENTED', '_create')
  }
}

module.exports = {
  Block,
  blockIdentifierSymbol,
  createBlockIdentifier
}
