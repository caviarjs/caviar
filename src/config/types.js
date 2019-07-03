const {isFunction, isObject} = require('core-util-is')
const {error} = require('./error')

// Usage

// ```
// const {Types} = require('caviar')
// Types.func.isRequired
// ```

class Type {
  constructor ({
    // `Function`
    check,
    isRequired = false
  }) {
    this._isRequired = isRequired
    this._check = check
  }

  get isRequired () {
    if (this._isRequired) {
      return this
    }

    return new Type({
      check: this._check,
      isRequired: true
    })
  }

  check ({
    value,
    key,
    configFile
  }) {
    if (!this._check({value, key, configFile})) {
      error('INVALID_ANCHOR', key, configFile, value)
    }
  }
}

const createChecker = is => ({value}) => is(value)
const CHECKER = {
  func: createChecker(isFunction),
  object: createChecker(isObject)
}

class Types {
  constructor () {
    this._types = Object.create(null)
  }

  _get (typeName) {
    const type = this._types[typeName]
    if (type) {
      return type
    }

    return this._types[typeName] = new Type({
      check: CHECKER[typeName]
    })
  }

  get func () {
    return this._get('func')
  }

  get object () {
    return this._get('object')
  }
}

module.exports = {
  Types,
  Type,
  types: new Types()
}
