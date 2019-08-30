const {get} = require('object-access')

const {UNDEFINED} = require('../constants')
const {defineWritable} = require('../utils')

const PROTECTED_SET_TARGET = Symbol('set-target')
const PROTECTED_SET_PATHS = Symbol('set-paths')

const PRIVATE_TARGET = Symbol('target')
const PRIVATE_PATHS = Symbol('paths')
const PRIVATE_COMPOSE = Symbol('compose')

const REDUCE = 'reduce'
const REDUCE_RIGHT = 'reduceRight'

const bail = ({prev, anchor}) => prev || anchor

class ConfigGetter {
  constructor () {
    defineWritable(this, PRIVATE_TARGET)
    defineWritable(this, PRIVATE_PATHS)
  }

  [PROTECTED_SET_TARGET] (target) {
    this[PRIVATE_TARGET] = target
  }

  [PROTECTED_SET_PATHS] (paths) {
    this[PRIVATE_PATHS] = paths
  }

  // Componse config anchor of kind `key` from each layer
  // from bottom to top
  [PRIVATE_COMPOSE] ({
    key,
    compose
  }, reduceType, defaultValue) {
    const target = this[PRIVATE_TARGET]

    // Always use after loaded
    // if (!isArray(target) || target.length === 0) {
    //   throw error('NOT_LOADED')
    // }

    return target[reduceType]((prev, current) => {
      const {configFile} = current
      const anchor = get(current, [...this[PRIVATE_PATHS], key])

      // We treat undefined as has no property
      // Just return the previous
      if (anchor === UNDEFINED) {
        return prev
      }

      return compose({
        prev,
        anchor,
        configFile
      })
    }, UNDEFINED) || defaultValue
  }

  compose (keyAndComposer, defaultValue) {
    return this[PRIVATE_COMPOSE](keyAndComposer, REDUCE, defaultValue)
  }

  // Iterate from top to bottom, return the first found
  bailTop (key, defaultValue) {
    return this[PRIVATE_COMPOSE]({
      key,
      compose: bail
    }, REDUCE_RIGHT, defaultValue)
  }

  // Iterate from bottom to top, return the first found
  bailBottom (key, defaultValue) {
    return this[PRIVATE_COMPOSE]({
      key,
      compose: bail
    }, REDUCE, defaultValue)
  }
}

module.exports = {
  ConfigGetter,
  PROTECTED_SET_TARGET,
  PROTECTED_SET_PATHS
}
