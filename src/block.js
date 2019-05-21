const PREFIX = 'caviar:block.id'

const blockIdentifierSymbol = Symbol.for(PREFIX)

const createBlockIdentifier = constructor =>
  Symbol.for(`${PREFIX}:${constructor.name}`)

class Block {
  constructor () {
    this[blockIdentifierSymbol] = createBlockIdentifier(this.constructor)
  }

  _composeConfig () {

  }

  _start () {
    throw new Error('should be implemented')
  }
}

module.exports = {
  Block,
  blockIdentifierSymbol,
  createBlockIdentifier
}
