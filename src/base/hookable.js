const {isFunction, isObject} = require('core-util-is')
const {
  create: createProxy,
  APPLY_TAPS,
  SET_HOOKS
} = require('tapable-proxy')

const {createError} = require('../error')
const {createSymbolFor, isSubClass} = require('../utils')

const error = createError('HOOKABLE')
const symbolFor = createSymbolFor('hookable')

// We use Symbol as private properties
const HOOKS = Symbol('hooks')
const EXTEND_HOOKS = Symbol('extendHooks')
const RESERVED_HOOKS_FACTORY = Symbol('reservedHooksFactory')

const FRIEND_SET_RESERVED_HOOKS_FACTORY =
  symbolFor('reserved-hooks-factory')

class Hookable {
  // - factory `Function(): object`
  [FRIEND_SET_RESERVED_HOOKS_FACTORY] (factory) {
    this[RESERVED_HOOKS_FACTORY] = factory
  }

  [EXTEND_HOOKS] (hooks) {
    if (!this[RESERVED_HOOKS_FACTORY]) {
      return hooks
    }

    const ret = {
      ...hooks
    }

    for (const [key, hook] of Object.entries(this[RESERVED_HOOKS_FACTORY]())) {
      if (key in ret) {
        throw error('RESERVED_HOOK_NAME', key)
      }

      ret[key] = hook
    }

    return ret
  }

  set hooks (hooks) {
    if (!isObject(hooks)) {
      throw error('INVALID_HOOKS', hooks)
    }

    // TODO: check hooks
    // adds default hooks
    this[HOOKS] = this[EXTEND_HOOKS](hooks)
  }

  get hooks () {
    const hooks = this[HOOKS]
    if (!hooks) {
      throw error('HOOKS_NOT_DEFINED')
    }

    return hooks
  }
}

// The thing to manage all Hookable and hooks
class HooksManager {
  constructor (hooks) {
    this._hooks = hooks
    this._map = new WeakMap()
    this.getHooks = this.getHooks.bind(this)
  }

  // - SubHookable `Hookable`
  getHooks (SubHookable) {
    // Caviar hooks
    if (arguments.length === 0) {
      return this._hooks
    }

    if (!isFunction(SubHookable)) {
      throw error('NO_CLASS')
    }

    if (!isSubClass(SubHookable, Hookable)) {
      throw error('NOT_HOOKABLE')
    }

    if (this._map.has(SubHookable)) {
      return this._map.get(SubHookable)
    }

    const hooksProxy = createProxy()
    this._map.set(SubHookable, hooksProxy)

    return hooksProxy
  }

  // Apply proxied hooks to real hooks
  applyHooks (SubHookable, hooks) {
    const proxy = this.getHooks(SubHookable)
    proxy[APPLY_TAPS](hooks)

    // For those assigned proxy hooks
    proxy[SET_HOOKS](hooks)

    // If `getHooks()` again, then it will get the real hooks
    this._map.set(SubHookable, hooks)
  }
}

module.exports = {
  FRIEND_SET_RESERVED_HOOKS_FACTORY,
  Hookable,
  HooksManager
}
